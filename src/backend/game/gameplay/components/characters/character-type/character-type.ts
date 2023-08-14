import type { CharacterAlignment } from '../character-alignment/character-alignment';

export interface ICharacterType {
    readonly id: string;

    readonly name: string;

    readonly alignment: CharacterAlignment;

    /**
     * Check whether this character type is the described character type.
     *
     * @param characterTypeName A canonical name for a character type.
     * @returns Whether this character type is character type described by `characterTypeName`.
     */
    isCharacterType(characterTypeName: string): boolean;
}
