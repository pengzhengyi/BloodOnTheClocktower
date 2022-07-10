import { EditionData, EditionKeyName } from './types';
import { IncompleteEditionData } from './exception';
import { CharacterSheet } from './charactersheet';
import { Generator } from './collections';
import { Character } from './character';
import { onlyLetters } from './common';

/**
 * {@link `glossary["Edition"]`}
 * A scenario of Clocktower that contains a set of tokens, character sheets, and a character almanac. For example, Trouble Brewing. Each edition has a unifying theme, strategy, and tone.
 */
export abstract class Edition {
    // TroubleBrewing = "Trouble Brewing",
    // SectsViolets  = "Sects & Violets",
    // BadMoonRising = "Bad Moon Rising"

    static REQUIRED_KEYNAMES = [EditionKeyName.CHARACTERS];

    static editionData: Partial<EditionData>;

    static get characterSheet(): CharacterSheet {
        if (this._characterSheet === undefined) {
            const characterTypeToCharacters =
                this.editionData[EditionKeyName.CHARACTERS]!;
            const characters = Generator.empty<string>();

            for (const key in characterTypeToCharacters) {
                const characterNames = characterTypeToCharacters[key];
                if (Array.isArray(characterNames)) {
                    characters.concat(characterNames);
                }
            }

            this._characterSheet = CharacterSheet.from(
                characters.map(Character.nameToId)
            );
        }

        return this._characterSheet;
    }

    private static _characterSheet?: CharacterSheet;

    static nameToId(name: string) {
        return onlyLetters(name);
    }

    static initialize(editionData: Partial<EditionData>) {
        this.checkForRequiredKeyNames(editionData);
        this.editionData = editionData;
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
}
