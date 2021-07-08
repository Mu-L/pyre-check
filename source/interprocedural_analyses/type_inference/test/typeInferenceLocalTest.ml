(*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

open Core
open OUnit2
open Ast
open Analysis
open TypeInference.Data
open Test
module Callable = Interprocedural.Callable

let setup_scratch_project ~context ?(sources = []) () = ScratchProject.setup ~context sources

let setup_environment scratch_project =
  let { ScratchProject.BuiltGlobalEnvironment.global_environment; _ } =
    scratch_project |> ScratchProject.build_global_environment
  in
  global_environment


module Setup = struct
  let make_function name : Callable.real_target =
    name |> Reference.create |> Callable.create_function


  let find_target ~resolution target =
    let qualifier, define =
      match target |> Callable.get_module_and_definition ~resolution with
      | Some module_and_definition -> module_and_definition
      | None ->
          let all_defines =
            resolution
            |> GlobalResolution.unannotated_global_environment
            |> UnannotatedGlobalEnvironment.ReadOnly.all_defines
          in
          raise
            (Failure
               (Format.asprintf
                  "No such define %a in %s"
                  Callable.pp_real_target
                  target
                  (all_defines |> List.map ~f:Reference.show |> String.concat ~sep:",")))
    in
    qualifier, define


  let set_up_project ~context code =
    let ({ ScratchProject.configuration; _ } as project) =
      ScratchProject.setup ~context ["test.py", code] ~infer:true
    in
    let environment =
      setup_environment project |> TypeEnvironment.create |> TypeEnvironment.read_only
    in
    environment, configuration


  let run_inference ~context ~target code =
    let environment, configuration = set_up_project ~context code in
    let global_resolution = environment |> TypeEnvironment.ReadOnly.global_resolution in
    let source =
      let ast_environment = GlobalResolution.ast_environment global_resolution in
      AstEnvironment.ReadOnly.get_processed_source ast_environment (Reference.create "test")
      |> fun option -> Option.value_exn option
    in
    let module_results =
      TypeInference.Local.infer_for_module ~configuration ~global_resolution ~source
    in
    let is_target { LocalResult.define = { name; _ }; _ } =
      Reference.equal name (Reference.create target)
    in
    let first = function
      | head :: _ -> head
      | [] -> failwith ("Could not find target define " ^ target)
    in
    module_results |> List.filter ~f:is_target |> first
end

let assert_json_equal ~context ~expected result =
  let expected = Yojson.Safe.from_string expected in
  assert_equal ~ctxt:context ~printer:Yojson.Safe.pretty_to_string expected result


let check_inference_results ~context ~target ~expected code =
  let result = Setup.run_inference ~context ~target code |> LocalResult.to_yojson in
  (* Filter out toplevel and __init__ defines, which are verbose and uninteresting *)
  let actual =
    if
      String.is_suffix target ~suffix:"__init__" or String.is_substring target ~substring:"toplevel"
    then
      match result with
      | `Assoc pairs ->
          `Assoc (pairs |> List.filter ~f:(fun (key, _) -> not (String.equal key "define")))
      | json -> json
    else
      result
  in
  assert_json_equal ~context ~expected actual


let test_inferred_returns context =
  let check_inference_results = check_inference_results ~context in
  check_inference_results
    {|
      def foo(x: int):
        return x
    |}
    ~target:"test.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.foo",
            "parent": null,
            "return": "int",
            "parameters": [
              { "name": "x", "annotation": "int", "value": null, "index": 0 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 2 },
            "async": false
          },
          "abstract": false
        }
      |}


let option_to_json string_option =
  string_option |> Option.map ~f:(Format.asprintf "\"%s\"") |> Option.value ~default:"null"


let test_inferred_function_parameters context =
  let check_inference_results = check_inference_results ~context in
  let single_parameter
      ?(define_name = "test.foo")
      ?(name = "x")
      ?default
      ?(type_ = "int")
      ?(line = 2)
      ~return
      ()
    =
    Format.asprintf
      {|
      {
        "globals": [],
        "attributes": [],
        "define": {
          "name": "%s",
          "parent": null,
          "return": "%s",
          "parameters": [
            { "name": "%s", "annotation": "%s", "value": %s, "index": 0 }
          ],
          "decorators": [],
          "location": { "qualifier": "test", "path": "test.py", "line": %d },
          "async": false
        },
        "abstract": false
      }
    |}
      define_name
      return
      name
      type_
      (option_to_json default)
      line
  in
  check_inference_results
    {|
      def foo(x: typing.Any) -> None:
          x = 5
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"None" ());
  check_inference_results
    {|
      def foo(x) -> int:
          return x
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"int" ());
  check_inference_results
    {|
      def foo(x) -> None:
          y = 1
          x = y
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"None" ());
  check_inference_results
    {|
      def foo(x) -> int:
          y = x
          return y
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"int" ());
  check_inference_results
    {|
      def foo(x) -> int:
          y = 5
          x = y
          return x
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"int" ());
  check_inference_results
    {|
      def foo(y) -> int:
          z = y
          x = y
          return x
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~name:"y" ~return:"int" ());
  check_inference_results
    {|
      def foo(x = 5) -> int:
          return x
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"int" ~default:"5" ());
  check_inference_results
    {|
      def foo(x: typing.Any = 5) -> None:
          pass
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"None" ~default:"5" ());
  (* TODO(T84365830): Ensure we correctly qualify inferred parameter types. *)
  check_inference_results
    {|
      from typing import Optional
      def foo(x) -> Optional[str]:
          return x
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"typing.Optional[str]" ~type_:"Optional[str]" ~line:3 ());
  check_inference_results
    {|
      def foo(y) -> typing.Tuple[int, float]:
          x = y
          z = y
          return (x, z)
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~name:"y" ~return:"typing.Tuple[int, float]" ());
  check_inference_results
    {|
      def foo(x) -> typing.Tuple[int, float]:
          z = y
          x = y
          return (x, z)
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"typing.Tuple[int, float]" ());
  (* TODO(T84365830): Handle union with default values *)
  check_inference_results
    {|
      def foo(x = None) -> None:
          if x:
              x = ""
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"None" ~type_:"str" ~default:"None" ());
  check_inference_results
    {|
      from typing import Optional
      def foo(x: Optional[str]):
          return x

      def bar(x = None) -> None:
          foo(x)
    |}
    ~target:"test.foo"
    ~expected:(single_parameter ~return:"Optional[str]" ~type_:"typing.Optional[str]" ~line:3 ());
  check_inference_results
    {|
      from typing import Optional
      def foo(x: Optional[str]):
          return x

      def bar(x = None) -> None:
          foo(x)
    |}
    ~target:"test.bar"
    ~expected:
      (single_parameter
         ~define_name:"test.bar"
         ~return:"None"
         ~default:"None"
         ~type_:"Optional[str]"
         ~line:6
         ());
  let no_inferences_json ?(line = 2) ?(return = "None") () =
    Format.asprintf
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.foo",
            "parent": null,
            "return": "%s",
            "parameters": [
              { "name": "x", "annotation": null, "value": null, "index": 0 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": %d },
            "async": false
          },
          "abstract": false
        }
      |}
      return
      line
  in
  (* TODO(T84365830): Support inference on addition. *)
  check_inference_results
    {|
      def foo(x) -> None:
          x += 1
    |}
    ~target:"test.foo"
    ~expected:(no_inferences_json ());
  (* Ensure analysis doesn't crash when __iadd__ is called with non-simple names. *)
  check_inference_results
    {|
      def foo(x) -> None:
          x[0] += y[3]
    |}
    ~target:"test.foo"
    ~expected:(no_inferences_json ());
  (* TODO(T84365830): Implement support for partial annotations *)
  check_inference_results
    {|
      from typing import Optional
      def foo(x) -> None:
          y: List[Any] = []
          x = y
    |}
    ~target:"test.foo"
    ~expected:(no_inferences_json ~line:3 ());
  check_inference_results
    {|
      def foo(x) -> int:
          x = y
          y = z
          return z
    |}
    ~target:"test.foo"
    ~expected:(no_inferences_json ~return:"int" ());
  check_inference_results
    {|
      def foo(x, y) -> int:
          b = 5
          a, b = x, y
          a += b
          return a
    |}
    ~target:"test.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.foo",
            "parent": null,
            "return": "int",
            "parameters": [
              { "name": "x", "annotation": "int", "value": null, "index": 0 },
              { "name": "y", "annotation": "int", "value": null, "index": 1 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 2 },
            "async": false
          },
          "abstract": false
        }
     |};
  (* TODO(T84365830): Handle nested tuples. *)
  check_inference_results
    {|
      def foo(x, y, z) -> typing.Tuple[typing.Tuple[str, int], bool]:
          return ((x, y), z)
    |}
    ~target:"test.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.foo",
            "parent": null,
            "return": "typing.Tuple[typing.Tuple[str, int], bool]",
            "parameters": [
              { "name": "x", "annotation": null, "value": null, "index": 0 },
              { "name": "y", "annotation": null, "value": null, "index": 1 },
              { "name": "z", "annotation": "bool", "value": null, "index": 2 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 2 },
            "async": false
          },
          "abstract": false
        }
     |};
  check_inference_results
    {|
      def foo(a, x = 15):
          b = a.c()
          b = int(b)
          if b > x:
              x = b
    |}
    ~target:"test.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.foo",
            "parent": null,
            "return": "None",
            "parameters": [
              { "name": "a", "annotation": null, "value": null, "index": 0 },
              { "name": "x", "annotation": "int", "value": "15", "index": 1 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 2 },
            "async": false
          },
          "abstract": false
        }
     |};
  ()


let test_inferred_method_parameters context =
  let check_inference_results = check_inference_results ~context in
  let single_parameter_method ?(class_name = "test.B") ~type_ ~return ~line () =
    Format.asprintf
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "%s.foo",
            "parent": "%s",
            "return": %s,
            "parameters": [
              { "name": "self", "annotation": null, "value": null, "index": 0 },
              { "name": "x", "annotation": %s, "value": null, "index": 1 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": %d },
            "async": false
          },
          "abstract": false
        }
      |}
      class_name
      class_name
      (option_to_json return)
      (option_to_json type_)
      line
  in
  check_inference_results
    {|
      class A:
          def foo(self, x: int) -> None: ...
      class B(A):
          def foo(self, x) -> None:
              return x
    |}
    ~target:"test.B.foo"
    ~expected:(single_parameter_method ~type_:(Some "int") ~line:5 ~return:(Some "None") ());
  check_inference_results
    {|
      class A:
          def foo(self, x: "A") -> "A": ...
      class B(A):
          def foo(self, x):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:(single_parameter_method ~type_:(Some "A") ~line:5 ~return:None ());
  (* Don't override explicit annotations if they clash with parent class *)
  check_inference_results
    {|
      class A:
          def foo(self, x: int) -> int: ...
      class B(A):
          def foo(self, x: str) -> str:
              return x
    |}
    ~target:"test.B.foo"
    ~expected:(single_parameter_method ~type_:(Some "str") ~line:5 ~return:(Some "str") ());
  let no_inferences = single_parameter_method ~type_:None ~return:None in
  check_inference_results
    {|
      from typing import Any
      class A:
          def foo(self, x: Any) -> int: ...
      class B(A):
          def foo(self, x):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:(no_inferences ~line:6 ());
  check_inference_results
    {|
      from typing import TypeVar
      T = TypeVar("T")
      class A:
          def foo(self, x: T) -> T: ...
      class B(A):
          def foo(self, x):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:(no_inferences ~line:7 ());
  check_inference_results
    {|
      class A:
          def foo(self, x: int) -> int: ...
      class B(A):
          def foo(self, x):
              return x
      class C(B):
          def foo(self, x):
              return x + 1
    |}
    ~target:"test.C.foo"
    ~expected:(no_inferences ~class_name:"test.C" ~line:8 ());
  (* Do not propagate types on `self` *)
  check_inference_results
    {|
      class A:
          def foo(self: "A") -> str: ...
      class B(A):
          def foo(self):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.B.foo",
            "parent": "test.B",
            "return": null,
            "parameters": [
              { "name": "self", "annotation": null, "value": null, "index": 0 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 5 },
            "async": false
          },
          "abstract": false
        }
     |};
  (* Do not propagate types on `self` *)
  check_inference_results
    {|
      class A:
          def foo(self, x: int, y: str) -> int: ...
      class B(A):
          def foo(self, x, y: str):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.B.foo",
            "parent": "test.B",
            "return": null,
            "parameters": [
              { "name": "self", "annotation": null, "value": null, "index": 0 },
              { "name": "x", "annotation": "int", "value": null, "index": 1 },
              { "name": "y", "annotation": "str", "value": null, "index": 2 }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 5 },
            "async": false
          },
          "abstract": false
        }
     |};
  check_inference_results
    {|
      class A:
          def foo(self, *args: str, **kwargs: float) -> int: ...
      class B(A):
          def foo(self, *args, **kwargs):
              return x
    |}
    ~target:"test.B.foo"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "define": {
            "name": "test.B.foo",
            "parent": "test.B",
            "return": null,
            "parameters": [
              { "name": "self", "annotation": null, "value": null, "index": 0 },
              { "name": "*args", "annotation": "str", "value": null, "index": 1 },
              {
                "name": "**kwargs",
                "annotation": "float",
                "value": null,
                "index": 2
              }
            ],
            "decorators": [],
            "location": { "qualifier": "test", "path": "test.py", "line": 5 },
            "async": false
          },
          "abstract": false
        }
     |};
  ()


let test_inferred_globals context =
  let check_inference_results = check_inference_results ~context in
  check_inference_results
    {|
      def foo() -> int:
        return 1234
      x = foo()
    |}
    ~target:"test.$toplevel"
    ~expected:
      {|
        {
          "globals": [
              {
                "name": "x",
                "location": { "qualifier": "test", "path": "test.py", "line": 4 },
                "annotation": "int"
              }
          ],
          "attributes": [],
          "abstract": false
        }
      |};
  check_inference_results
    {|
      x = 1 + 1
    |}
    ~target:"test.$toplevel"
    ~expected:
      {|
        {
          "globals": [
            {
              "name": "x",
              "location": { "qualifier": "test", "path": "test.py", "line": 2 },
              "annotation": "int"
            }
          ],
          "attributes": [],
          "abstract": false
        }
      |};
  check_inference_results
    {|
      x = unknown
      def foo() -> int:
        return x
    |}
    ~target:"test.$toplevel"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "abstract": false
        }
      |};
  (* TODO(T84365830): Implement support for global inference due to local usage. *)
  check_inference_results
    {|
      x = unknown
      def foo() -> None:
        global x
        x = 1
    |}
    ~target:"test.$toplevel"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [],
          "abstract": false
        }
      |};
  (* TODO(T84365830): Be more intelligent about inferring None type. *)
  check_inference_results
    {|
      foo = None
    |}
    ~target:"test.$toplevel"
    ~expected:
      {|
        {
          "globals": [
            {
              "name": "foo",
              "location": { "qualifier": "test", "path": "test.py", "line": 2 },
              "annotation": "None"
            }
          ],
          "attributes": [],
          "abstract": false
        }
      |};
  ()


let test_inferred_attributes context =
  let check_inference_results = check_inference_results ~context in
  check_inference_results
    {|
      def foo() -> int:
        return 1
      class Foo:
        x = foo()
    |}
    ~target:"test.Foo.$class_toplevel"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [
            {
              "parent": "Foo",
              "name": "x",
              "location": { "qualifier": "test", "path": "test.py", "line": 5 },
              "annotation": "int"
            }
          ],
          "abstract": false
        }
      |};
  check_inference_results
    {|
      class Foo:
        x = 1 + 1
    |}
    ~target:"test.Foo.$class_toplevel"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [
            {
              "parent": "Foo",
              "name": "x",
              "location": { "qualifier": "test", "path": "test.py", "line": 3 },
              "annotation": "int"
            }
          ],
          "abstract": false
        }
      |};
  check_inference_results
    {|
      class Foo:
        def __init__(self) -> None:
          self.x = 1 + 1
    |}
    ~target:"test.Foo.__init__"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [
            {
              "parent": "Foo",
              "name": "x",
              "location": { "qualifier": "test", "path": "test.py", "line": 4 },
              "annotation": "int"
            }
          ],
          "abstract": false
        }
      |};
  check_inference_results
    {|
      class Foo:
        def __init__(self) -> None:
          self.x = self.foo()

        def foo(self) -> int:
          return 1
    |}
    ~target:"test.Foo.__init__"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [
            {
              "parent": "Foo",
              "name": "x",
              "location": { "qualifier": "test", "path": "test.py", "line": 4 },
              "annotation": "int"
            }
          ],
          "abstract": false
        }
      |};
  (* TODO(T84365830): Be more intelligent about inferring None type. *)
  check_inference_results
    {|
    class Foo:
      foo = None
    |}
    ~target:"test.Foo.$class_toplevel"
    ~expected:
      {|
        {
          "globals": [],
          "attributes": [
            {
              "parent": "Foo",
              "name": "foo",
              "location": { "qualifier": "test", "path": "test.py", "line": 3 },
              "annotation": "None"
            }
          ],
          "abstract": false
        }
      |};
  ()


let () =
  "typeInferenceLocalTest"
  >::: [
         "test_inferred_returns" >:: test_inferred_returns;
         "test_inferred_function_parameters" >:: test_inferred_function_parameters;
         "test_inferred_method_parameters" >:: test_inferred_method_parameters;
         "test_inferred_globals" >:: test_inferred_globals;
         "test_inferred_attributes" >:: test_inferred_attributes;
       ]
  |> Test.run
