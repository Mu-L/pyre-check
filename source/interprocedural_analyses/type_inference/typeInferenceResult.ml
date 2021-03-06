(*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

open Core
open Analysis
open Interprocedural

module ResultArgument = struct
  type result = AnalysisError.Instantiated.t list

  type call_model = TypeInferenceDomain.t [@@deriving show]

  let name = "type_inference"

  let empty_model = TypeInferenceDomain.bottom

  let obscure_model = TypeInferenceDomain.bottom

  let join ~iteration:_ = TypeInferenceDomain.join

  let widen ~iteration ~previous ~next = join ~iteration previous next

  let reached_fixpoint ~iteration:_ ~previous ~next =
    TypeInferenceDomain.less_or_equal ~left:next ~right:previous


  let get_errors _ = []

  let externalize ~filename_lookup:_ callable result_option model =
    let result_json =
      match result_option with
      | None -> `Null
      | Some result ->
          `List (List.map ~f:(fun error -> AnalysisError.Instantiated.to_yojson error) result)
    in
    [
      `Assoc
        [
          "analysis", `String name;
          "name", `String (Callable.show callable);
          "model", `String (show_call_model model);
          "result", result_json;
        ];
    ]


  let metadata () = `Assoc []

  let statistics () = `Assoc []

  let strip_for_callsite model = model
end

include Interprocedural.Result.Make (ResultArgument)
