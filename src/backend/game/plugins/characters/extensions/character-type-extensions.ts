import { CharacterAlignment } from '../character-alignment/character-alignment';
import type { ICharacterType } from '../character-type/character-type';

export abstract class CharacterTypeExtensions {
    static isMinion(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('minion');
    }

    static isDemon(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('demon');
    }

    static isTownsfolk(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('townsfolk');
    }

    static isOutsider(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('outsider');
    }

    static isTraveller(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('traveller');
    }

    static isFabled(characterType: ICharacterType): boolean {
        return characterType.isCharacterType('fabled');
    }

    static isEvil(characterType: ICharacterType): boolean {
        return characterType.alignment === CharacterAlignment.Evil;
    }

    static isGood(characterType: ICharacterType): boolean {
        return characterType.alignment === CharacterAlignment.Good;
    }
}
