(*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

open Base
open OUnit2
module Path = Pyre.Path

(* Create aliases to private modules so we could test their internal APIs. *)
module BuildMap = Buck__BuildMap
module Builder = Buck__Builder
module Target = Buck__Target

let test_parse_buck_query_output context =
  let assert_parsed ~expected output =
    let actual = Builder.parse_buck_query_output output in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: string list]
      ~printer:(fun targets -> Sexp.to_string_hum ([%sexp_of: string list] targets))
      expected
      actual
  in
  let assert_not_parsed output =
    try
      let _ = Builder.parse_buck_query_output output in
      let message = Format.sprintf "Unexpected parsing success: %s" output in
      assert_failure message
    with
    | Builder.JsonError _ -> ()
  in

  assert_parsed "{}" ~expected:[];
  assert_parsed {|
     {"//foo:bar":[]}
  |} ~expected:[];
  assert_parsed {|
     {"//foo:bar":["//foo:bar"]}
  |} ~expected:["//foo:bar"];
  assert_parsed
    {|
      {
        "//foo:bar":["//foo:bar"],
        "//foo:baz":["//foo:baz"]
      }
    |}
    ~expected:["//foo:bar"; "//foo:baz"];
  assert_parsed
    {|
      {
        "//foo:bar":["//foo:bar", "//foo:qux"],
        "//foo:baz":["//foo:baz", "//foo:bar"]
      }
    |}
    ~expected:["//foo:bar"; "//foo:baz"; "//foo:qux"];
  assert_parsed
    {|
      {
        "//foo:bar":["//foo:bar", "//foo:baz-mypy_ini", "foo:qux-testmodules-lib"]
      }
    |}
    ~expected:["//foo:bar"];

  assert_not_parsed "42";
  assert_not_parsed "derp";
  assert_not_parsed {|"abc"|};
  assert_not_parsed "[]";
  assert_not_parsed {| { foo: 42 } |};
  assert_not_parsed {| { "foo": 42 } |};
  assert_not_parsed {| { "foo": { "bar": 42 } } |};
  assert_not_parsed {| { "foo": [], "bar": 42 } |};
  assert_not_parsed {| { "foo": [ 42 ] } |};
  assert_not_parsed {| { "foo": [ { "bar": 42 } ] } |};
  ()


let test_parse_buck_build_output context =
  let assert_parsed ~expected output =
    let actual = Builder.parse_buck_build_output output in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: (string * string) list]
      ~printer:(fun items -> Sexp.to_string_hum ([%sexp_of: (string * string) list] items))
      expected
      actual
  in
  let assert_not_parsed output =
    try
      let _ = Builder.parse_buck_build_output output in
      let message = Format.sprintf "Unexpected parsing success: %s" output in
      assert_failure message
    with
    | Builder.JsonError _ -> ()
  in

  assert_parsed "{}" ~expected:[];
  assert_parsed
    {|
     {"//foo:bar": "/path/to/sourcedb.json"}
  |}
    ~expected:["//foo:bar", "/path/to/sourcedb.json"];
  assert_parsed
    {|
      {
        "//foo:bar":"/path/to/bar.json",
        "//foo:baz":"/path/to/baz.json"
      }
    |}
    ~expected:["//foo:bar", "/path/to/bar.json"; "//foo:baz", "/path/to/baz.json"];

  assert_not_parsed "42";
  assert_not_parsed "derp";
  assert_not_parsed {|"abc"|};
  assert_not_parsed "[]";
  assert_not_parsed {| { foo: 42 } |};
  assert_not_parsed {| { "foo": 42 } |};
  assert_not_parsed {| { "foo": { "bar": 42 } } |};
  assert_not_parsed {| { "foo": "derp", "bar": 42 } |};
  assert_not_parsed {| { "foo": [ "bar" ] } |};
  ()


let test_merge_build_map context =
  let assert_loaded ~targets ~build_map target_and_build_maps =
    let actual_targets, actual_build_map =
      List.map target_and_build_maps ~f:(fun (target, build_map) ->
          Target.of_string target, BuildMap.Partial.of_alist_exn build_map)
      |> Builder.merge_build_maps
    in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: string list]
      ~printer:(fun targets -> Sexp.to_string_hum ([%sexp_of: string list] targets))
      targets
      (List.map actual_targets ~f:Target.show);
    let actual_build_map = BuildMap.to_alist actual_build_map in
    let compare = [%compare: string * string] in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: (string * string) list]
      ~printer:(fun mappings -> Sexp.to_string_hum ([%sexp_of: (string * string) list] mappings))
      (List.sort ~compare build_map)
      (List.sort ~compare actual_build_map)
  in

  assert_loaded [] ~targets:[] ~build_map:[];
  assert_loaded
    ["//foo:bar", ["a.py", "source/a.py"]]
    ~targets:["//foo:bar"]
    ~build_map:["a.py", "source/a.py"];
  assert_loaded
    ["//foo:bar", ["a.py", "source/a.py"; "b.py", "source/b.py"]]
    ~targets:["//foo:bar"]
    ~build_map:["a.py", "source/a.py"; "b.py", "source/b.py"];
  assert_loaded
    ["//foo:bar", ["a.py", "source/a.py"]; "//foo:baz", ["b.py", "source/b.py"]]
    ~targets:["//foo:bar"; "//foo:baz"]
    ~build_map:["a.py", "source/a.py"; "b.py", "source/b.py"];
  assert_loaded
    [
      "//foo:bar", ["a.py", "source/a.py"; "b.py", "source/b.py"];
      "//foo:baz", ["b.py", "source/b.py"];
    ]
    ~targets:["//foo:bar"; "//foo:baz"]
    ~build_map:["a.py", "source/a.py"; "b.py", "source/b.py"];
  assert_loaded
    [
      "//foo:bar", ["a.py", "source/a.py"; "x.py", "source/b.py"];
      (* Conflict on `x.py` *)
      "//foo:baz", ["d.py", "source/d.py"; "x.py", "source/c.py"];
      "//foo:qux", ["e.py", "source/e.py"];
    ]
    ~targets:["//foo:bar"; "//foo:qux"]
    ~build_map:["a.py", "source/a.py"; "x.py", "source/b.py"; "e.py", "source/e.py"];
  assert_loaded
    [
      "//foo:bar", ["a.py", "source/a.py"];
      "//foo:baz", ["b.py", "source/b.py"; "x.py", "source/c.py"];
      (* Conflict on `x.py` *)
      "//foo:qux", ["e.py", "source/e.py"; "x.py", "source/d.py"];
    ]
    ~targets:["//foo:bar"; "//foo:baz"]
    ~build_map:["a.py", "source/a.py"; "b.py", "source/b.py"; "x.py", "source/c.py"];
  assert_loaded
    [
      "//foo:bar", ["a.py", "source/a.py"; "x.py", "source/b.py"];
      (* Conflict on `x.py` *)
      "//foo:baz", ["d.py", "source/d.py"; "x.py", "source/c.py"];
      (* Conflict on `x.py` *)
      "//foo:qux", ["e.py", "source/e.py"; "x.py", "source/f.py"];
    ]
    ~targets:["//foo:bar"]
    ~build_map:["a.py", "source/a.py"; "x.py", "source/b.py"];
  ()


let test_lookup_source context =
  let assert_lookup ~source_root ~artifact_root ~build_map ~expected path =
    let index = BuildMap.Partial.of_alist_exn build_map |> BuildMap.create |> BuildMap.index in
    let actual =
      Builder.do_lookup_source
        ~index
        ~source_root:(Path.create_absolute source_root)
        ~artifact_root:(Path.create_absolute artifact_root)
        (Path.create_absolute path)
      |> Option.map ~f:Path.absolute
    in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: string option]
      ~printer:(fun result -> Sexp.to_string_hum ([%sexp_of: string option] result))
      expected
      actual
  in

  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/artifact/a.py"
    ~expected:(Some "/source/a.py");
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "b.py"]
    "/artifact/a.py"
    ~expected:(Some "/source/b.py");
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/artifact/b.py"
    ~expected:None;
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/source/a.py"
    ~expected:None;
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["foo/a.py", "a.py"; "bar/b.py", "b.py"]
    "/artifact/foo/b.py"
    ~expected:None;
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["foo/a.py", "a.py"; "bar/b.py", "b.py"]
    "/artifact/bar/b.py"
    ~expected:(Some "/source/b.py");
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "foo/a.py"; "b.py", "bar/b.py"]
    "/artifact/a.py"
    ~expected:(Some "/source/foo/a.py");
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"; "b.py", "a.py"]
    "/artifact/a.py"
    ~expected:(Some "/source/a.py");
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"; "b.py", "a.py"]
    "/artifact/b.py"
    ~expected:(Some "/source/a.py");
  ()


let test_lookup_artifact context =
  let assert_lookup ~source_root ~artifact_root ~build_map ~expected path =
    let index = BuildMap.Partial.of_alist_exn build_map |> BuildMap.create |> BuildMap.index in
    let actual =
      Builder.do_lookup_artifact
        ~index
        ~source_root:(Path.create_absolute source_root)
        ~artifact_root:(Path.create_absolute artifact_root)
        (Path.create_absolute path)
      |> List.map ~f:Path.absolute
    in
    assert_equal
      ~ctxt:context
      ~cmp:[%compare.equal: string list]
      ~printer:(fun result -> Sexp.to_string_hum ([%sexp_of: string list] result))
      (List.sort ~compare:String.compare expected)
      (List.sort ~compare:String.compare actual)
  in

  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/source/a.py"
    ~expected:["/artifact/a.py"];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "b.py"]
    "/source/b.py"
    ~expected:["/artifact/a.py"];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/source/b.py"
    ~expected:[];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"]
    "/artifact/a.py"
    ~expected:[];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["foo/a.py", "a.py"; "bar/b.py", "b.py"]
    "/source/b.py"
    ~expected:["/artifact/bar/b.py"];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "foo/a.py"; "b.py", "bar/b.py"]
    "/source/foo/a.py"
    ~expected:["/artifact/a.py"];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "foo/a.py"; "b.py", "bar/b.py"]
    "/source/foo/b.py"
    ~expected:[];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["a.py", "a.py"; "b.py", "a.py"]
    "/source/a.py"
    ~expected:["/artifact/a.py"; "/artifact/b.py"];
  assert_lookup
    ~source_root:"/source"
    ~artifact_root:"/artifact"
    ~build_map:["foo/a.py", "baz/a.py"; "bar/b.py", "baz/a.py"]
    "/source/baz/a.py"
    ~expected:["/artifact/foo/a.py"; "/artifact/bar/b.py"];
  ()


let () =
  "builder_test"
  >::: [
         "parse_buck_query_output" >:: test_parse_buck_query_output;
         "parse_buck_build_output" >:: test_parse_buck_build_output;
         "merge_build_map" >:: test_merge_build_map;
         "lookup_source" >:: test_lookup_source;
         "lookup_artifact" >:: test_lookup_artifact;
       ]
  |> Test.run
