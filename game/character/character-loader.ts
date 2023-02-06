import { randomChoice } from '../common';
import { NoCharacterMatchingId } from '../exception';
import { Character, type CharacterToken } from './character';
import {
    CHARACTERS,
    ID_TO_CHARACTER,
} from '~/content/characters/output/characters';

export interface ICharacterLoader {
    randomLoad(): CharacterToken;
    tryLoad(id: string): CharacterToken | undefined;
    loadAsync(id: string): Promise<CharacterToken>;
}

export const CharacterLoader: ICharacterLoader = class CharacterLoader {
    static randomLoad(): CharacterToken {
        return randomChoice(CHARACTERS);
    }

    static tryLoad(id: string): CharacterToken | undefined {
        return ID_TO_CHARACTER.get(Character.getCanonicalId(id));
    }

    static async loadAsync(id: string): Promise<CharacterToken> {
        const error = new NoCharacterMatchingId(id);
        await error.throwWhen(
            (error) => this.tryLoad(error.correctedId) === undefined
        );

        return this.tryLoad(error.correctedId)!;
    }
};
