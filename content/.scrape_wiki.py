from collections import defaultdict
import json
import os
import requests
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from functools import wraps
from itertools import chain 
from typing import Any, Iterable, Callable
from urllib.parse import urljoin
from bs4 import BeautifulSoup, PageElement
from rich.console import Console
from rich.traceback import install
from tqdm import tqdm
import logging
from rich.logging import RichHandler

logging.basicConfig(
    level="NOTSET",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(rich_tracebacks=True)]
)


console = Console()


def guarded_execute(action):
    @wraps(action)
    def wrapper(*args, **kwargs):
        try:
            return action(*args, **kwargs)
        except Exception:
            logging.exception("Error")

    return wrapper 


def get_root_dir() -> str:
    dirpath = os.getcwd()
    while os.path.basename(dirpath) != 'BloodOnTheClocktower':
        dirpath = os.path.dirname(dirpath)
    return dirpath

def get_content_dir() -> str:
    return os.path.join(get_root_dir(), 'content')

def get_edition_dir() -> str:
    return os.path.join(get_content_dir() , 'editions')

def get_character_dir() -> str:
    return os.path.join(get_content_dir() , 'characters')

def resolve_wiki_page_from_relative_url(url: str) -> str:
    return urljoin(main_page_url, url) 

def resolve_wiki_page_from_href(href: PageElement) -> str:
    return resolve_wiki_page_from_relative_url(href['href'])

main_page_url = "https://wiki.bloodontheclocktower.com/Main_Page"

def get_page_soup(url: str) -> BeautifulSoup:
    main_page = requests.get(url).text 
    return BeautifulSoup(main_page)

def get_main_page_soup() -> BeautifulSoup:
    return get_page_soup(url=main_page_url)


def get_page_section_elements(soup: BeautifulSoup, get_section_start: Callable[[BeautifulSoup], PageElement], is_section_element: Callable[[PageElement], bool], is_another_section: Callable[[PageElement], bool]) -> Iterable[PageElement]:
    current_element = get_section_start(soup)

    while True:
        current_element = current_element.next_sibling

        if current_element is None or is_another_section(current_element):
            break

        if is_section_element(current_element):
            yield current_element

def get_page_sections(soup: BeautifulSoup, get_section_start: Callable[[BeautifulSoup], PageElement], is_section_element: Callable[[PageElement], bool], is_another_section: Callable[[PageElement], bool]) -> dict[PageElement, list[PageElement]]:
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

def get_page_section_rows(soup: BeautifulSoup, header_str: str) -> Iterable[PageElement]:
    return get_page_section_elements(soup, get_section_start=lambda soup: soup.find("h2", string=header_str), is_section_element=lambda element: element.name == 'div' and 'row' in element['class'], is_another_section=lambda element: element.name == 'h2')

def get_main_page_section_rows(header_str: str) -> Iterable[PageElement]:
    return get_page_section_rows(get_main_page_soup(), header_str)

def get_text(element: PageElement, strip=True, lower=False, strip_quote=False) -> str:
    text = element.get_text()
    if strip:
        text = text.strip()
    if lower:
        text = text.lower()
    if strip_quote:
        text = text.strip('"' + "'")
    return text

def join_text(elements: Iterable[PageElement], separator: str = '\n', **kwargs: Any) -> str:
    return separator.join(filter(None, (get_text(element, **kwargs) for element in elements))).strip()


def get_edition_links() -> Iterable[str]:
    edition_links_divs = get_main_page_section_rows("Characters By Edition") 
    edition_hrefs = chain.from_iterable(edition_links_div.find_all("a", class_=lambda class_: class_ is None or class_.lower() != 'internal') for edition_links_div in edition_links_divs)
    return map(resolve_wiki_page_from_href, edition_hrefs)


def get_character_type_links() -> Iterable[str]:
    character_type_divs = get_main_page_section_rows("Character By Type")

    character_type_hrefs = chain.from_iterable(character_type_div.find_all("a", title=lambda title: title.startswith('Category:')) for character_type_div in character_type_divs)
    return map(resolve_wiki_page_from_href, character_type_hrefs)


@guarded_execute
def scrape_edition_page(url: str) -> dict[str, Any]:
    soup = get_page_soup(url)

    name = get_text(soup.h1)

    synopsis_title = soup.find(id="Synopsis")
    synopsis_div = next(parent for parent in synopsis_title.parents if parent.name == 'div')
    synopsis = join_text(synopsis_div.find_all('p'))

    main_content_div = synopsis_div.find_next_sibling('div')
    characters: dict[str, list[str]] = dict()
    for characters_group_header in main_content_div.find_all("h3"):
        character_groupname = get_text(characters_group_header)
        character_groupname_lower = character_groupname.lower()
        character_group_ul = soup.find(id=character_groupname).parent.find_next_sibling('ul')
        character_names = [get_text(character) for character in character_group_ul.find_all("h4")]
        characters[character_groupname_lower] = character_names

    table_of_content = soup.find(id="toc")
    description_paragraphs = list(reversed(table_of_content.find_previous_siblings("p")))
    description = join_text(description_paragraphs).strip()

    try:
        difficulty = description_paragraphs[1].get_text().split('.', maxsplit=1)[0].strip()
    except Exception:
        logging.exception(f'Cannot determine difficulty for {name}')
        difficulty = 'Not Specified'

    guide: dict[str, str] = dict()
    try:
        good_player_guide_index = description.index("Good players")
        evil_player_guide_index = description.index("Evil players")
        guide["good players"] = description[good_player_guide_index:evil_player_guide_index].strip()
        guide["evil players"] = description[evil_player_guide_index:].strip()
    except Exception:
        if name != 'Experimental Characters':
            logging.exception(f'{name} do not have guide for good players and evil players')
        

    data =  {
        "name": name,
        "url": url,
        "synopsis": synopsis,
        "characters": characters,
        "description": description,
        "difficulty": difficulty,
        "guide": guide
    }
    return data 


def get_character_links(character_type_page_link: str) -> Iterable[str]:
    soup = get_page_soup(character_type_page_link)
    character_hrefs = soup.select('.mw-category-group a')
    return map(resolve_wiki_page_from_href, character_hrefs)


@guarded_execute
def scrape_character_page(character_page_link: str) -> dict[str, Any]:
    soup = get_page_soup(character_page_link)

    name = get_text(soup.h1)
    id = name.lower()

    appears_in_element = soup.find(id="Appears_in").parent

    categories_div = soup.find(id="categories")
    categories_hrefs = categories_div.find_all('a', title=lambda title: title.startswith('Category'))
    if (num_categories := len(categories_hrefs)) >= 1:
        edition_href = categories_hrefs[0]
        edition = get_text(edition_href, lower=True)
    else:
        logging.error(f"Cannot infer edition and character type from categories for {name}")

    if num_categories >= 2:
        character_type_href = categories_hrefs[1]
        character_type = get_text(character_type_href, lower=True)
    else:
        # infer where it appears
        character_type = appears_in_element.find_next_sibling('div').find('a')['title']

    character_text_elements = get_page_section_elements(soup, get_section_start=lambda soup: soup.find(id="Character_Text").parent, is_section_element=lambda element: element.name == 'p', is_another_section=lambda element: element.name == 'h2')
    character_text = join_text(character_text_elements, strip_quote=True)

    example_gameplay_divs = get_page_section_rows(soup, "Example Gameplay")
    example_gameplay = [get_text(example_gameplay_div, strip=True) for example_gameplay_div in example_gameplay_divs]

    tip_section_start = soup.find(id="Example_Gameplay").parent.find_next_sibling('h2')

    tip_section_to_elements = get_page_sections(soup, get_section_start=lambda soup: tip_section_start, is_section_element=lambda element: element.name != 'h2', is_another_section=lambda element: element.name == 'h2')
    tips = {get_text(tip_section): join_text(tip_section_elements) for tip_section, tip_section_elements in tip_section_to_elements.items()}
    
    soliloquy_element = appears_in_element.find_previous_sibling('div')
    soliloquy = get_text(soliloquy_element, strip_quote=True)

    toc_element = soup.find(id="toc")
    about_element = toc_element.find_previous_sibling('p')
    if about_element is None:
        about = ''
    else:
        about = get_text(about_element, strip_quote=True)

    data = {
        "id": id,
        "image": f"assets/icons/{id}.png",
        "about": about,
        "edition": edition,
        "name": name,
        "team": character_type,
        "ability": character_text,
        "gameplay": example_gameplay,
        "tips": tips,
        "soliloquy": soliloquy
    }
    return data


def write_json(filepath: str, data: Any) -> None:
    with open(filepath, 'w') as filewriter:
        json.dump(data, filewriter, indent=4, sort_keys=True)


def write_editions(edition_folder: str) -> None:
    edition_links = get_edition_links()

    for edition_link in tqdm(edition_links):
        data = scrape_edition_page(edition_link)
        if data is None:
            continue
        filepath = os.path.join(edition_folder, f'{data["name"]}.json')
        write_json(filepath, data)


def write_characters(characters_folder: str) -> None:
    character_links = chain.from_iterable(get_character_links(character_type_link) for character_type_link in get_character_type_links())

    for character_link in tqdm(character_links):
        data = scrape_character_page(character_link)
        if data is None:
            continue
        filepath = os.path.join(characters_folder, f'{data["id"]}.json')
        write_json(filepath, data)
