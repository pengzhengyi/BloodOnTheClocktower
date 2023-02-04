import { type EditionData, EditionKeyName } from './types';
import { IncompleteEditionData } from './exception';
import { CharacterSheet } from './character/character-sheet';
import { Generator } from './collections';
import type { CharacterToken } from './character/character';
import { onlyLetters } from './common';
import type { CharacterType } from './character/character-type';

export enum EditionName {
    TroubleBrewing = 'Trouble Brewing',
    SectsViolets = 'Sects & Violets',
    BadMoonRising = 'Bad Moon Rising',
    ExperimentalCharacters = 'Experimental Characters',
}

/**
 * {@link `glossary["Edition"]`}
 * A scenario of Clocktower that contains a set of tokens, character sheets, and a character almanac. For example, Trouble Brewing. Each edition has a unifying theme, strategy, and tone.
 */
export abstract class Edition {
    static REQUIRED_KEYNAMES = [EditionKeyName.CHARACTERS];

    static editionData: Partial<EditionData>;

    static get characterSheet(): CharacterSheet {
        if (this._characterSheet === undefined) {
            const characterTypeToCharacters =
                this.editionData[EditionKeyName.CHARACTERS];
            if (characterTypeToCharacters === undefined) {
                throw new IncompleteEditionData(
                    this.editionData,
                    EditionKeyName.CHARACTERS
                );
            }
            const characters = Generator.empty<string>();

            for (const key in characterTypeToCharacters) {
                const characterNames = characterTypeToCharacters[key];
                if (Array.isArray(characterNames)) {
                    characters.concat(characterNames);
                }
            }

            this._characterSheet = CharacterSheet.from(characters);
        }

        return this._characterSheet;
    }

    static get characters(): Array<CharacterToken> {
        return this.characterSheet.characters;
    }

    static get minion(): Array<CharacterToken> {
        return this.characterSheet.minion;
    }

    static get demon(): Array<CharacterToken> {
        return this.characterSheet.demon;
    }

    static get townsfolk(): Array<CharacterToken> {
        return this.characterSheet.townsfolk;
    }

    static get outsider(): Array<CharacterToken> {
        return this.characterSheet.outsider;
    }

    static get traveller(): Array<CharacterToken> {
        return this.characterSheet.traveller;
    }

    static get fabled(): Array<CharacterToken> {
        return this.characterSheet.fabled;
    }

    private static _characterSheet?: CharacterSheet;

    static is(edition: typeof Edition): boolean {
        return Object.is(this, edition);
    }

    static getCanonicalName(name: string) {
        return onlyLetters(name);
    }

    static initialize(editionData: Partial<EditionData>) {
        this.checkForRequiredKeyNames(editionData);
        this.editionData = editionData;
    }

    static getCharactersByType(
        characterType: typeof CharacterType
    ): Array<CharacterToken> {
        return this.characterSheet.getCharactersByType(characterType);
    }

    static toJSON() {
        return this.editionData;
    }

    protected static checkForRequiredKeyNames(
        editionData: Partial<EditionData>
    ) {
        for (const requiredKeyName of this.REQUIRED_KEYNAMES) {
            if (editionData[requiredKeyName] === undefined) {
                throw new IncompleteEditionData(editionData, requiredKeyName);
            }
        }
    }

    protected constructor() {
        throw new Error(
            'Cannot instantiate Edition, meant to use as static class.'
        );
    }
}

export function createCustomEdition(
    editionData: Partial<EditionData>
): typeof Edition {
    const customEdition = class extends Edition {};
    customEdition.initialize(editionData);
    return customEdition;
}
