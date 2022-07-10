import { Character } from './character';
import { CharacterLoader } from './characterloader';
import { LazyMap } from './collections';
import { NoCharacterMatchingId } from './exception';

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

    protected static _find(id: string, character?: typeof Character) {
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }

    constructor(readonly characters: Array<typeof Character>) {
        this.characters = characters;
    }
}
