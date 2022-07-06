import { Character } from './character';

/**
 * {@link `glossory["Character sheet"]`}
 * The cardboard sheets that list all of the possible characters and their abilities for the chosen edition.
 */
export class CharacterSheet {
    constructor(readonly characters: Array<Character>) {
        this.characters = characters;
    }
}
