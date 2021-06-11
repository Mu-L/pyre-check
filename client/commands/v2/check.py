# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import dataclasses
import logging
import os
import subprocess
from pathlib import Path
from typing import Sequence, Optional, Dict, Any

from ... import commands, command_arguments, configuration as configuration_module
from . import remote_logging, backend_arguments


LOG: logging.Logger = logging.getLogger(__name__)


@dataclasses.dataclass(frozen=True)
class Arguments:
    """
    Data structure for configuration options the backend check command can recognize.
    Need to keep in sync with `pyre/command/newCheckCommand.ml`
    """

    log_path: str
    global_root: str
    source_paths: backend_arguments.SourcePath

    additional_logging_sections: Sequence[str] = dataclasses.field(default_factory=list)
    checked_directory_allowlist: Sequence[str] = dataclasses.field(default_factory=list)
    checked_directory_blocklist: Sequence[str] = dataclasses.field(default_factory=list)
    debug: bool = False
    excludes: Sequence[str] = dataclasses.field(default_factory=list)
    extensions: Sequence[str] = dataclasses.field(default_factory=list)
    relative_local_root: Optional[str] = None
    memory_profiling_output: Optional[Path] = None
    number_of_workers: int = 1
    parallel: bool = True
    profiling_output: Optional[Path] = None
    python_version: configuration_module.PythonVersion = (
        configuration_module.PythonVersion(major=3)
    )
    shared_memory: configuration_module.SharedMemory = (
        configuration_module.SharedMemory()
    )
    remote_logging: Optional[backend_arguments.RemoteLogging] = None
    search_paths: Sequence[configuration_module.SearchPathElement] = dataclasses.field(
        default_factory=list
    )
    show_error_traces: bool = False
    strict: bool = False

    @property
    def local_root(self) -> Optional[str]:
        if self.relative_local_root is None:
            return None
        return os.path.join(self.global_root, self.relative_local_root)

    def serialize(self) -> Dict[str, Any]:
        local_root = self.local_root
        return {
            "source_paths": self.source_paths.serialize(),
            "search_paths": [
                element.command_line_argument() for element in self.search_paths
            ],
            "excludes": self.excludes,
            "checked_directory_allowlist": self.checked_directory_allowlist,
            "checked_directory_blocklist": self.checked_directory_blocklist,
            "extensions": self.extensions,
            "log_path": self.log_path,
            "global_root": self.global_root,
            **({} if local_root is None else {"local_root": local_root}),
            "debug": self.debug,
            "strict": self.strict,
            "python_version": {
                "major": self.python_version.major,
                "minor": self.python_version.minor,
                "micro": self.python_version.micro,
            },
            "shared_memory": self.shared_memory.to_json(),
            "show_error_traces": self.show_error_traces,
            "parallel": self.parallel,
            "number_of_workers": self.number_of_workers,
            "additional_logging_sections": self.additional_logging_sections,
            **(
                {}
                if self.remote_logging is None
                else {"remote_logging": self.remote_logging.serialize()}
            ),
            **(
                {}
                if self.profiling_output is None
                else {"profiling_output": str(self.profiling_output)}
            ),
            **(
                {}
                if self.memory_profiling_output is None
                else {"memory_profiling_output": str(self.memory_profiling_output)}
            ),
        }


def create_check_arguments(
    configuration: configuration_module.Configuration,
    check_arguments: command_arguments.CheckArguments,
) -> Arguments:
    """
    Translate client configurations to backend check configurations.

    This API is not pure since it needs to access filesystem to filter out
    nonexistent directories. It is idempotent though, since it does not alter
    any filesystem state.
    """
    source_paths = backend_arguments.get_source_path_for_check(configuration)

    logging_sections = check_arguments.logging_sections
    additional_logging_sections = (
        [] if logging_sections is None else logging_sections.split(",")
    )
    if check_arguments.noninteractive:
        additional_logging_sections.append("-progress")

    profiling_output = (
        backend_arguments.get_profiling_log_path(Path(configuration.log_directory))
        if check_arguments.enable_profiling
        else None
    )
    memory_profiling_output = (
        backend_arguments.get_profiling_log_path(Path(configuration.log_directory))
        if check_arguments.enable_memory_profiling
        else None
    )

    logger = configuration.logger
    remote_logging = (
        backend_arguments.RemoteLogging(
            logger=logger, identifier=check_arguments.log_identifier or ""
        )
        if logger is not None
        else None
    )

    return Arguments(
        log_path=configuration.log_directory,
        global_root=configuration.project_root,
        additional_logging_sections=additional_logging_sections,
        checked_directory_allowlist=(
            list(source_paths.get_checked_directory_allowlist())
            + configuration.get_existent_do_not_ignore_errors_in_paths()
        ),
        checked_directory_blocklist=(
            configuration.get_existent_ignore_all_errors_paths()
        ),
        debug=check_arguments.debug,
        excludes=configuration.excludes,
        extensions=configuration.get_valid_extension_suffixes(),
        relative_local_root=configuration.relative_local_root,
        memory_profiling_output=memory_profiling_output,
        number_of_workers=configuration.get_number_of_workers(),
        parallel=not check_arguments.sequential,
        profiling_output=profiling_output,
        python_version=configuration.get_python_version(),
        shared_memory=configuration.shared_memory,
        remote_logging=remote_logging,
        search_paths=configuration.expand_and_get_existent_search_paths(),
        show_error_traces=check_arguments.show_error_traces,
        source_paths=source_paths,
        strict=configuration.strict,
    )


def _run_check_command(command: Sequence[str]) -> commands.ExitCode:
    result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=None,
        universal_newlines=True,
    )
    return_code = result.returncode

    if return_code == 0:
        LOG.warning(f"{result.stdout}")
        return commands.ExitCode.SUCCESS
    else:
        LOG.error(f"Check command exited with non-zero return code: {return_code}")
        return commands.ExitCode.FAILURE


def run_check(
    configuration: configuration_module.Configuration,
    check_arguments: command_arguments.CheckArguments,
) -> commands.ExitCode:
    binary_location = configuration.get_binary_respecting_override()
    if binary_location is None:
        raise configuration_module.InvalidConfiguration(
            "Cannot locate a Pyre binary to run."
        )

    arguments = create_check_arguments(configuration, check_arguments)
    with backend_arguments.temporary_argument_file(arguments) as argument_file_path:
        check_command = [binary_location, "newcheck", str(argument_file_path)]
        return _run_check_command(check_command)


@remote_logging.log_usage(command_name="check")
def run(
    configuration: configuration_module.Configuration,
    check_arguments: command_arguments.CheckArguments,
) -> commands.ExitCode:
    try:
        return run_check(configuration, check_arguments)
    except Exception as error:
        raise commands.ClientException(
            f"Exception occured during Pyre check: {error}"
        ) from error
