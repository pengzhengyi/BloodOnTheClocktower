import json
import logging
import os
import re
from collections import defaultdict
from functools import partial
from glob import iglob
from itertools import chain
from pathlib import Path
from typing import Any, Iterable, List, Optional, Tuple

from rich.logging import RichHandler
from tqdm import tqdm

from .scrape_wiki import (
    create_dir,
    get_characters_dir,
    get_raw_characters_dir,
    write_json,
)

logging.basicConfig(
    level="NOTSET",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(rich_tracebacks=True)],
)

CharacterDefinition = dict[str, Any]
CharacterDefinitions = list[CharacterDefinition]
CharacterEnrichment = CharacterDefinition | CharacterDefinitions


@create_dir
def get_enrich_characters_dir() -> str:
    """Get characters directory path"""
    return os.path.join(get_characters_dir(), "enrich")


@create_dir
def get_output_characters_dir() -> str:
    """Get characters directory path"""
    return os.path.join(get_characters_dir(), "output")


def _get_enrich_files(enrich_dirpath: str) -> Iterable[str]:
    return (
        os.path.join(enrich_dirpath, filename)
        for filename in iglob("enrich*.json", root_dir=enrich_dirpath)
    )


def _get_raw_character_files(raw_characters_dirpath: str) -> Iterable[str]:
    return (
        os.path.join(raw_characters_dirpath, filename)
        for filename in iglob("*.json", root_dir=raw_characters_dirpath)
    )


def _get_enrich_order(enrich_filepath: str, default: Optional[int] = None) -> int:
    match = re.search(r"enrich(?P<order>-?\d+)\.json", enrich_filepath)
    if match:
        return int(match.groupdict()["order"])
    else:
        if default is None:
            raise ValueError(f"Cannot infer enrichment order from {enrich_filepath}")
        else:
            return default


def _get_character_enrichment(enrich_file: str) -> CharacterEnrichment:
    with open(enrich_file, "r", encoding="utf-8") as file_reader:
        return json.load(file_reader)


def _get_character_enrichments(enrich_files: Iterable[str]) -> Iterable[CharacterEnrichment]:
    sorted_enrich_files = sorted(enrich_files, key=partial(_get_enrich_order, default=0))
    return map(_get_character_enrichment, sorted_enrich_files)


def _enrich(character_enrichments: Iterable[CharacterEnrichment]) -> Iterable[CharacterDefinition]:
    definitions: dict[str, CharacterDefinition] = defaultdict(dict)

    for character_enrichment in character_enrichments:
        if isinstance(character_enrichment, list):
            character_definitions: list[CharacterDefinition] = character_enrichment
        else:
            character_definitions = [character_enrichment]

        for character_definition in character_definitions:
            character_id = character_definition["id"]
            definitions[character_id].update(character_definition)

    return definitions.values()


def _write_typescript(
    typescript_filepath: str, definition: CharacterDefinition
) -> Tuple[str, str]:
    if definition is None:
        return

    path = Path(typescript_filepath)
    relative_json_filepath = f"./{path.with_suffix('.json').name}"

    character_id: str = definition["id"]
    character_name = character_id.capitalize()
    with open(typescript_filepath, "w", encoding="utf-8") as file_writer:
        file_writer.write(
            f"""import roleData from "{relative_json_filepath}";
import {{ Character }} from "~/game/character";

export abstract class {character_name} extends Character {{
}}

{character_name}.initialize(roleData);"""
        )

    return (
        f'import {{ {character_name} }} from "./{path.stem}";',
        f'ID_TO_CHARACTER.set("{character_id}", {character_name});',
    )


def _write_typescript_export(filepath: str, imports: List[Tuple[str, str]]) -> None:
    with open(filepath, "w", encoding="utf-8") as file_writer:
        import_statements, mapset_statements = zip(*imports)
        file_writer.writelines(
            import_statement + os.linesep for import_statement in import_statements
        )
        file_writer.write(
            'import { Character } from "~/game/character";' + os.linesep + os.linesep
        )

        file_writer.write(
            "export const ID_TO_CHARACTER: Map<string, typeof Character> = new Map();" + os.linesep
        )
        file_writer.writelines(
            mapset_statement + os.linesep for mapset_statement in mapset_statements
        )


def _write_enrichment(definitions: Iterable[CharacterDefinition], output_dirpath: str) -> None:
    imports: List[Tuple[str, str]] = []

    for definition in tqdm(definitions):
        character_id = definition["id"]
        json_filepath = os.path.join(output_dirpath, f"{character_id}.json")
        typescript_filepath = os.path.join(output_dirpath, f"{character_id}.ts")
        write_json(json_filepath, definition)
        imports.append(_write_typescript(typescript_filepath, definition))

    typescript_export_filepath = os.path.join(output_dirpath, "characters.ts")
    _write_typescript_export(typescript_export_filepath, imports)


def enrich() -> None:
    """Enrich character definitions"""
    enrich_dirpath = get_enrich_characters_dir()
    output_dirpath = get_output_characters_dir()
    raw_characters_dirpath = get_raw_characters_dir()

    enrich_files = _get_enrich_files(enrich_dirpath)
    raw_character_files = _get_raw_character_files(raw_characters_dirpath)
    character_enrichments = _get_character_enrichments(chain(enrich_files, raw_character_files))
    character_definitions = _enrich(character_enrichments)

    _write_enrichment(character_definitions, output_dirpath)


if __name__ == "__main__":
    enrich()
