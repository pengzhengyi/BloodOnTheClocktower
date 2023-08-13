import type { CharacterAlignment } from '../character-alignment/character-alignment';

export interface ICharacterType {
    readonly id: string;

    readonly name: string;

    readonly alignment: CharacterAlignment;
}
