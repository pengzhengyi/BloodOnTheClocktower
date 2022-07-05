---
title: Overview
description: 'Provide an overview of static content'
---

## Folder Structure

### Editions

The folder `editions` contains information scraped from wiki about editions for the game.

### Game Information

The folder `game-information` contains game information in general.

### Characters

The folder contains information about characters.

- `characters/raw` contains character information scraped from wiki.
- `characters/enrich` contains extra information for characters. For example, it might contain extra information like the position that this character acts on the first / other nights or an entirely new character.

#### Character Enrichment

##### Enrichment Order

To define an enrichment, create a JSON file named `enrich<n>.json` where `n` is the enrichment order.

0 is reserved for raw character information scraped from the wiki.

The larger the number, the later that enrichment will happen.

For example, suppose there is a `enrich-1.json` file defining `acrobat` and `snowman` (a custom character) and a `enrich1.json` defining `imp`.

Then

- `acrobat` will have information from `enrich-1.json` and wiki (higher priority).
- `snowman` will only have information from `enrich-1.json`.
- `imp` will only have information from `enrich1.json` (higher priority) and wiki.

##### Enrichment Format

The enrichment file have two formats:

- **dictionary** For example `{"id": "acrobat", "reminders": ["Die"]}` will insert a key `remainders` value `["Die"]` into the **acrobat** character. If there is no character with id `acrobat`, a new character will be introduced.
- **list of dictionary** In this case, each dictionary will be applied sequentially.

#### Character Id

Character id is simply the alphabet-only all-lowercase version of character name.

For example:

- `Fortune Teller` becomes `fortuneteller`
- `Al-Hadikhia` becomes `alhadikhia`

## How to scrape

Wiki scraping is defined in `content/scrape_wiki.py`.

```bash
$ python -m "content.scrape_wiki" -h
usage: scrape_wiki.py [-h] [-e] [-c] [-g] [-a]

Scrape Blood On The Clocktower wiki for various information

options:
  -h, --help            show this help message and exit
  -e, --edition         Whether to scrape information about editions
  -c, --character       Whether to scrape information about characters
  -g, --general, --game-information
                        Whether to scrape information about game information in general
  -a, --all             Scrape everything
```

For example,

- `python -m "content.scrape_wiki" -c` scrape characters information.
- `python -m "content.scrape_wiki" -a` scrape everything.
- `python -m "content.scrape_wiki" -e -g` scrape editions and general information.

## How to Enrich

Wiki enrich is defined in `content/enrich_characters.py`.
It can be run `python -m "content.enrich_characters"`.
