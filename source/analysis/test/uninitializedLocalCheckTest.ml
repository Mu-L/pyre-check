(*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

open Core
open OUnit2
open Analysis
open Test

let assert_uninitialized_errors ~context =
  let check ~configuration ~environment ~source =
    UninitializedLocalCheck.run
      ~configuration
      ~environment:(TypeEnvironment.read_only environment)
      ~source
  in
  assert_errors ~context ~check


let test_simple context =
  let assert_uninitialized_errors = assert_uninitialized_errors ~context in

  assert_uninitialized_errors
    {|
      def f():
        x = y
        y = 5
    |}
    ["Uninitialized local [61]: Local variable `y` may not be initialized here."];

  assert_uninitialized_errors {|
      def f(y):
        x = y
        y = 5
    |} [];

  assert_uninitialized_errors
    {|
      def f(x):
        if x > 5:
          return y   # Error
        y = 5
        z = 5
        return z   # OK
    |}
    ["Uninitialized local [61]: Local variable `y` may not be initialized here."];

  assert_uninitialized_errors
    {|
      def f(x):
        if x > 5:
          y = 2
        return y
    |}
    ["Uninitialized local [61]: Local variable `y` may not be initialized here."];

  assert_uninitialized_errors
    {|
      def f() -> int:
          try:
              bad = 0 / 0
              x = 1  # `x` is defined here
          except ZeroDivisionError:
              return x
    |}
    ["Uninitialized local [61]: Local variable `x` may not be initialized here."];

  assert_uninitialized_errors
    {|
      x, y, z = 0, 0, 0
      def access_global() -> int:
        global y
        _ = x      # Refers to local `x`, hence error
        x = 1
        _ = y      # Refers to global `y`, explictly specified
        y = 1
        _ = z      # Refers to global `z`, implicitly
    |}
    ["Uninitialized local [61]: Local variable `x` may not be initialized here."];

  assert_uninitialized_errors
    {|
      class Foo(object):
        pass
      def f():
        return Foo()
    |}
    [];

  assert_uninitialized_errors
    {|
      def f():
        def g():
          pass
        g()
    |}
    [];

  assert_uninitialized_errors {|
      def f():
        x, y = 0, 0
        return x, y
    |} [];

  assert_uninitialized_errors
    {|
      def f( *args, **kwargs) -> None:
        print(args)
        print(list(kwargs.items()))
    |}
    [];

  assert_uninitialized_errors
    {|
      x = 0
      def f() -> None:
        global x
        if x == 0:
          x = 1
    |}
    [];

  (* should be: no error *)
  assert_uninitialized_errors {|
      def f(x: str) -> None:
        assert True, x
    |} [];

  (* should be: no error *)
  assert_uninitialized_errors
    {|
      from media import something
      def f():
        something()
        media = 1
    |}
    [];

  assert_uninitialized_errors {|
      def f():
        (x := 0)
    |} [];

  assert_uninitialized_errors {|
      def f():
        ((x := 0) and (y := x))
    |} [];

  (* TODO (T94201165): walrus operator same-expression false negative *)
  assert_uninitialized_errors {|
      def f():
        ((y := x) and (x := 0))
    |} [];

  assert_uninitialized_errors {|
      def f():
        [y for x in [1,2,3] if (y:=x) > 2]
    |} [];

  (* Extracted from a real-world example. should be: In foo(harness_config), harness_config might
     not be defined. *)
  assert_uninitialized_errors
    {|
      from dataclasses import dataclass
      from typing import Optional
      import random

      @dataclass
      class Task(object):
          harness_config: int

      def get_task(i: int) -> Task:
          return Task(harness_config=i)

      def foo(i: int) -> int:
          return i

      def outer() -> None:
          def inner(task_id: int) -> None:
              if random.random():
                  pass
              else:
                  task = get_task(task_id)

                  if task.harness_config:
                      harness_config = task.harness_config
                  foo(harness_config)
      |}
    [];

  ()


let () = "uninitializedCheck" >::: ["simple" >:: test_simple] |> Test.run
