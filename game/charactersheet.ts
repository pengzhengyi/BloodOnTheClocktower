import { Character } from './character';
import { CharacterLoader } from './characterloader';
import { LazyMap } from './collections';
import { NoCharacterMatchingId } from './exception';

/**
 * {@link `glossory["Character sheet"]`}
 * The cardboard sheets that list all of the possible characters and their abilities for the chosen edition.
 */
export class CharacterSheet {
    static readonly ALL_CHARACTERS: Map<string, Promise<typeof Character>> =
        new LazyMap(CharacterLoader.load);

    static async find(id: string) {
        const character = await this.ALL_CHARACTERS.get(id);

        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }

        return character;
    }

    constructor(readonly characters: Array<typeof Character>) {
        this.characters = characters;
    }
}
