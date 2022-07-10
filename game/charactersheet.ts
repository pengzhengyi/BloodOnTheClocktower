import { Character } from './character';
import { CharacterLoader } from './characterloader';
import { Generator, LazyMap } from './collections';
import {
    CharacterLoadFailures,
    GameError,
    NoCharacterMatchingId,
} from './exception';
import { EditionData, EditionKeyName } from './types';

/**
 * {@link `glossary["Character sheet"]`}
 * The cardboard sheets that list all of the possible characters and their abilities for the chosen edition.
 */
export class CharacterSheet {
    static readonly ALL_CHARACTERS: Map<string, typeof Character> = new LazyMap(
        CharacterLoader.load
    );

    static readonly ALL_CHARACTERS_ASYNC: Map<
        string,
        Promise<typeof Character>
    > = new LazyMap(CharacterLoader.loadAsync);

    static find(id: string) {
        const character = this.ALL_CHARACTERS.get(id);
        return this._find(id, character);
    }

    static async findAsync(id: string) {
        const character =
            this.ALL_CHARACTERS.get(id) ||
            (await this.ALL_CHARACTERS_ASYNC.get(id));
        return this._find(id, character);
    }

    static from(characterIds: Iterable<string>): CharacterSheet {
        const characters = Array.from(
            Generator.once(characterIds).map((id) => CharacterSheet.find(id))
        );

        if (characters.length === 0) {
            const innerError = new GameError(
                'No character id is provided when initializing character sheet'
            );
            throw new CharacterLoadFailures([innerError], []);
        }

        return new this(characters);
    }

    protected static _find(id: string, character?: typeof Character) {
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }

    constructor(readonly characters: Array<typeof Character>) {
        this.characters = characters;
    }

    toObject(): EditionData[EditionKeyName.CHARACTERS] {
        const characterTypeToCharacters = Generator.groupBy(
            this.characters,
            (character) => character.characterType
        );

        const characterTypeAndCharacters: Iterable<[string, Array<string>]> =
            Generator.map(
                ([characterType, characters]) => [
                    characterType.id,
                    characters.map((character) => character.id),
                ],
                characterTypeToCharacters
            );

        return Object.fromEntries(characterTypeAndCharacters);
    }
}
