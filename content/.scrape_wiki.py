import argparse
import json
import logging
import os
from collections import defaultdict
from contextlib import suppress
from functools import partial, wraps
from itertools import chain
from operator import eq
from typing import Any, Callable, Iterable, Iterator, Optional, ParamSpec, TypeVar
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, PageElement
from rich.console import Console
from rich.logging import RichHandler
from tqdm import tqdm

logging.basicConfig(
    level="NOTSET",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(rich_tracebacks=True)],
)


console = Console()

T = TypeVar("T")
P = ParamSpec("P")


def guarded_execute(action: Callable[P, T]) -> Callable[P, Optional[T]]:
    """Execute a function while catch and log any exception"""

    @wraps(action)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> Optional[T]:
        try:
            return action(*args, **kwargs)
        except Exception:
            logging.exception("Error")
            return None

    return wrapper


def _get_root_dir() -> str:
    dirpath = os.getcwd()
    while os.path.basename(dirpath) != "BloodOnTheClocktower":
        dirpath = os.path.dirname(dirpath)
    return dirpath


def _get_content_dir() -> str:
    return os.path.join(_get_root_dir(), "content")


def _get_edition_dir() -> str:
    return os.path.join(_get_content_dir(), "editions")


def _get_character_dir() -> str:
    return os.path.join(_get_content_dir(), "characters")


def _get_game_information_dir() -> str:
    return os.path.join(_get_content_dir(), "game-information")


def _resolve_wiki_page_from_relative_url(url: str) -> str:
    return urljoin(MAIN_PAGE_URL, url)


def _resolve_wiki_page_from_href(href: PageElement) -> str:
    return _resolve_wiki_page_from_relative_url(href["href"])


MAIN_PAGE_URL = "https://wiki.bloodontheclocktower.com/Main_Page"


def _get_page_soup(url: str) -> BeautifulSoup:
    main_page = requests.get(url).text
    return BeautifulSoup(main_page, features="html.parser")


def _get_main_page_soup() -> BeautifulSoup:
    return _get_page_soup(url=MAIN_PAGE_URL)


def _get_page_section_elements(
    soup: BeautifulSoup,
    get_section_start: Callable[[BeautifulSoup], PageElement],
    is_section_element: Callable[[PageElement], bool],
    is_another_section: Callable[[PageElement], bool],
) -> Iterable[PageElement]:
    current_element = get_section_start(soup)

    while True:
        current_element = current_element.next_sibling

        if current_element is None or is_another_section(current_element):
            break

        if is_section_element(current_element):
            yield current_element


def _get_page_sections(
    soup: BeautifulSoup,
    get_section_start: Callable[[BeautifulSoup], PageElement],
    is_section_element: Callable[[PageElement], bool],
    is_another_section: Callable[[PageElement], bool],
) -> dict[PageElement, list[PageElement]]:
    section_to_elements: dict[PageElement, list[PageElement]] = defaultdict(list)

    current_section = current_element = get_section_start(soup)

    while True:
        current_element = current_element.next_sibling

        if current_element is None:
            break

        if is_another_section(current_element):
            current_section = current_element

        if is_section_element(current_element):
            section_to_elements[current_section].append(current_element)

    return section_to_elements


def _get_page_section_rows(soup: BeautifulSoup, header_str: str) -> Iterable[PageElement]:
    return _get_page_section_elements(
        soup,
        get_section_start=lambda soup: soup.find("h2", string=header_str),
        is_section_element=lambda element: element.name == "div" and "row" in element["class"],
        is_another_section=lambda element: element.name == "h2",
    )


def _get_main_page_section_rows(header_str: str) -> Iterable[PageElement]:
    return _get_page_section_rows(_get_main_page_soup(), header_str)


def _get_text(
    element: PageElement, strip: bool = True, lower: bool = False, strip_quote: bool = False
) -> str:
    text = element.get_text()
    if strip:
        text = text.strip()
    if lower:
        text = text.lower()
    if strip_quote:
        text = text.strip('"' + "'")
    return text


def _join_text(elements: Iterable[PageElement], separator: str = "\n", **kwargs: Any) -> str:
    return separator.join(
        filter(None, (_get_text(element, **kwargs) for element in elements))
    ).strip()


def _get_edition_links() -> Iterable[str]:
    edition_links_divs = _get_main_page_section_rows("Characters By Edition")
    edition_hrefs = chain.from_iterable(
        edition_links_div.find_all(
            "a", class_=lambda class_: class_ is None or class_.lower() != "internal"
        )
        for edition_links_div in edition_links_divs
    )
    return map(_resolve_wiki_page_from_href, edition_hrefs)


def _get_character_type_links() -> Iterable[str]:
    character_type_divs = _get_main_page_section_rows("Character By Type")

    character_type_hrefs = chain.from_iterable(
        character_type_div.find_all("a", title=lambda title: title.startswith("Category:"))
        for character_type_div in character_type_divs
    )
    return map(_resolve_wiki_page_from_href, character_type_hrefs)


def _get_game_information_page_links() -> Iterator[str]:
    soup = _get_main_page_soup()
    game_information_sidebar_list_item = soup.find(id="p-Game_Information").parent
    characters_sidebar_list_item = soup.find(id="p-Characters").parent

    game_information_list_items = _get_page_section_elements(
        soup,
        get_section_start=lambda soup: game_information_sidebar_list_item,
        is_section_element=lambda element: element.name == "li",
        is_another_section=partial(eq, characters_sidebar_list_item),
    )
    for game_information_list_item in game_information_list_items:
        yield _resolve_wiki_page_from_href(game_information_list_item.find("a"))


@guarded_execute
def _scrape_edition_page(url: str) -> dict[str, Any]:
    soup = _get_page_soup(url)

    name = _get_h1_text(soup)

    synopsis_title = soup.find(id="Synopsis")
    synopsis_div = next(parent for parent in synopsis_title.parents if parent.name == "div")
    synopsis = _join_text(synopsis_div.find_all("p"))

    main_content_div = synopsis_div.find_next_sibling("div")
    characters: dict[str, list[str]] = dict()
    for characters_group_header in main_content_div.find_all("h3"):
        character_groupname = _get_text(characters_group_header)
        character_groupname_lower = character_groupname.lower()
        character_group_ul = soup.find(id=character_groupname).parent.find_next_sibling("ul")
        character_names = [_get_text(character) for character in character_group_ul.find_all("h4")]
        characters[character_groupname_lower] = character_names

    table_of_content = soup.find(id="toc")
    description_paragraphs = list(reversed(table_of_content.find_previous_siblings("p")))
    description = _join_text(description_paragraphs).strip()

    try:
        difficulty = description_paragraphs[1].get_text().split(".", maxsplit=1)[0].strip()
    except Exception:
        logging.exception("Cannot determine difficulty for %s", name)
        difficulty = "Not Specified"

    guide: dict[str, str] = dict()
    try:
        good_player_guide_index = description.index("Good players")
        evil_player_guide_index = description.index("Evil players")
        guide["good players"] = description[
            good_player_guide_index:evil_player_guide_index
        ].strip()
        guide["evil players"] = description[evil_player_guide_index:].strip()
    except Exception:
        if name != "Experimental Characters":
            logging.exception("%s do not have guide for good players and evil players", name)

    data = {
        "name": name,
        "url": url,
        "synopsis": synopsis,
        "characters": characters,
        "description": description,
        "difficulty": difficulty,
        "guide": guide,
    }
    return data


def _get_character_links(character_type_page_link: str) -> Iterable[str]:
    soup = _get_page_soup(character_type_page_link)
    character_hrefs = soup.select(".mw-category-group a")
    return map(_resolve_wiki_page_from_href, character_hrefs)


def _get_h1_text(soup: BeautifulSoup) -> str:
    return _get_text(soup.h1)


@guarded_execute
def _scrape_character_page(character_page_link: str) -> dict[str, Any]:
    soup = _get_page_soup(character_page_link)

    name = _get_h1_text(soup)
    character_id = name.lower()

    appears_in_element = soup.find(id="Appears_in").parent

    categories_div = soup.find(id="categories")
    categories_hrefs = categories_div.find_all(
        "a", title=lambda title: title.startswith("Category")
    )
    if (num_categories := len(categories_hrefs)) >= 1:
        edition_href = categories_hrefs[0]
        edition = _get_text(edition_href, lower=True)
    else:
        logging.error("Cannot infer edition and character type from categories for %s", name)

    if num_categories >= 2:
        character_type_href = categories_hrefs[1]
        character_type = _get_text(character_type_href, lower=True)
    else:
        # infer where it appears
        character_type = appears_in_element.find_next_sibling("div").find("a")["title"]

    character_text_elements = _get_page_section_elements(
        soup,
        get_section_start=lambda soup: soup.find(id="Character_Text").parent,
        is_section_element=lambda element: element.name == "p",
        is_another_section=lambda element: element.name == "h2",
    )
    character_text = _join_text(character_text_elements, strip_quote=True)

    example_gameplay_divs = _get_page_section_rows(soup, "Example Gameplay")
    example_gameplay = [
        _get_text(example_gameplay_div, strip=True)
        for example_gameplay_div in example_gameplay_divs
    ]

    tip_section_start = soup.find(id="Example_Gameplay").parent.find_next_sibling("h2")

    tip_section_to_elements = _get_page_sections(
        soup,
        get_section_start=lambda soup: tip_section_start,
        is_section_element=lambda element: element.name != "h2",
        is_another_section=lambda element: element.name == "h2",
    )
    tips = {
        _get_text(tip_section): _join_text(tip_section_elements)
        for tip_section, tip_section_elements in tip_section_to_elements.items()
    }

    soliloquy_element = appears_in_element.find_previous_sibling("div")
    soliloquy = _get_text(soliloquy_element, strip_quote=True)

    toc_element = soup.find(id="toc")
    about_element = toc_element.find_previous_sibling("p")
    if about_element is None:
        about = ""
    else:
        about = _get_text(about_element, strip_quote=True)

    data = {
        "id": character_id,
        "image": f"assets/icons/{character_id}.png",
        "about": about,
        "edition": edition,
        "name": name,
        "team": character_type,
        "ability": character_text,
        "gameplay": example_gameplay,
        "tips": tips,
        "soliloquy": soliloquy,
    }
    return data


@guarded_execute
def _scrape_glossary(glossary_page_link: str) -> dict[str, str]:
    soup = _get_page_soup(glossary_page_link)

    glossary_paragraphs = soup.select("#content p")
    glossary: dict[str, str] = dict()

    for glossary_paragraph in glossary_paragraphs:
        paragraph_text = _get_text(glossary_paragraph)
        with suppress(ValueError):
            separator_index = paragraph_text.index(":")
            glossary[paragraph_text[:separator_index].strip()] = paragraph_text[
                separator_index + 1 :
            ].strip()

    return glossary


@guarded_execute
def _scrape_game_information(game_information_page_link: str) -> tuple[str, dict[str, str]]:
    soup = _get_page_soup(game_information_page_link)
    title = _get_h1_text(soup)
    section_to_elements = _get_page_sections(
        soup,
        get_section_start=lambda soup: soup.select_one("#toc + h2"),
        is_section_element=lambda element: element.name != "h2",
        is_another_section=lambda element: element.name == "h2",
    )
    section_to_text = {
        _get_text(tip_section): _join_text(tip_section_elements)
        for tip_section, tip_section_elements in section_to_elements.items()
    }
    return title, section_to_text


def _write_json(filepath: str, data: Any) -> None:
    if data is None:
        return

    with open(filepath, "w", encoding="utf-8") as file_writer:
        json.dump(data, file_writer, indent=4, sort_keys=True)


def write_editions(edition_folder: str) -> None:
    """Write scraped information about editions into the content folder."""
    edition_links = _get_edition_links()

    for edition_link in tqdm(edition_links):
        data = _scrape_edition_page(edition_link)
        if data is None:
            continue
        filepath = os.path.join(edition_folder, f'{data["name"]}.json')
        _write_json(filepath, data)


def write_characters(characters_folder: str) -> None:
    """Write scraped information about characters into the content folder."""
    character_links = chain.from_iterable(
        _get_character_links(character_type_link)
        for character_type_link in _get_character_type_links()
    )

    for character_link in tqdm(character_links):
        data = _scrape_character_page(character_link)
        if data is None:
            continue
        filepath = os.path.join(characters_folder, f'{data["id"]}.json')
        _write_json(filepath, data)


def write_game_information(game_information_folder: str) -> None:
    """Write scraped information about game information into the content folder."""
    game_information_page_link_iterator = _get_game_information_page_links()
    glossary_page_link = next(game_information_page_link_iterator)

    glossary_data = _scrape_glossary(glossary_page_link)
    glossary_filepath = os.path.join(game_information_folder, "glossary.json")
    _write_json(glossary_filepath, glossary_data)

    for game_information_page_link in game_information_page_link_iterator:
        if (scraped := _scrape_game_information(game_information_page_link)) is None:
            continue
        title, section_to_text = scraped
        filepath = os.path.join(game_information_folder, f"{title}.json")
        _write_json(filepath, section_to_text)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape Blood On The Clocktower wiki for various information"
    )

    parser.add_argument(
        "-e", "--edition", action="store_true", help="Whether to scrape information about editions"
    )
    parser.add_argument(
        "-c",
        "--character",
        action="store_true",
        help="Whether to scrape information about characters",
    )
    parser.add_argument(
        "-g",
        "--general",
        "--game-information",
        action="store_true",
        help="Whether to scrape information about game information in general",
    )

    args = parser.parse_args()

    if args.edition:
        write_editions(edition_folder=_get_edition_dir())
    if args.character:
        write_characters(characters_folder=_get_character_dir())
    if args.general:
        write_game_information(game_information_folder=_get_game_information_dir())


if __name__ == "__main__":
    main()
