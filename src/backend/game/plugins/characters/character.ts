import type { ICharacterType } from './character-type/character-type';
import type { ICharacterDefinition } from './definition/character-definition';
import type { CharacterId } from './id/character-id';

export interface ICharacter {
    /* basic properties */
    readonly id: CharacterId;
    readonly name: string;
    readonly characterType: ICharacterType;
    readonly firstNightOrder: number;
    readonly otherNightOrder: number;

    readonly definition: ICharacterDefinition;
}
