import axios, { AxiosRequestConfig } from 'axios';
import { Character } from './character';
import { CharacterLoadFailure, NoCharacterMatchingId } from './exception';
import type { RoleData } from './types';
import {
    CHARACTERS,
    ID_TO_CHARACTER,
} from '~/content/characters/output/characters';

export abstract class CharacterLoader {
    static randomLoad(): typeof Character {
        return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    }

    static tryLoad(id: string): typeof Character | undefined {
        return ID_TO_CHARACTER.get(Character.getCanonicalId(id));
    }

    static async loadAsync(id: string): Promise<typeof Character> {
        const error = new NoCharacterMatchingId(id);
        await error.throwWhen(
            (error) => this.tryLoad(error.correctedId) === undefined
        );

        return this.tryLoad(error.correctedId)!;
    }

    protected static loadWithRoleData(roleData: Partial<RoleData>) {
        const character = this.loadCharacterClass();
        character.initialize(roleData);
        return character;
    }

    protected static loadCharacterClass(): typeof Character {
        return class extends Character {};
    }

    protected static async loadCharacterRoleDataAsync(
        id: string
    ): Promise<Partial<RoleData>> {
        const config: AxiosRequestConfig = {};

        return await axios
            .get<Partial<RoleData>>(
                this.getCharacterRoleDataApiEndpoint(id),
                config
            )
            .catch((error) => {
                throw new CharacterLoadFailure(id, error);
            })
            .then((response) => response.data);
    }

    protected static getCharacterRoleDataApiEndpoint(id: string): string {
        return `/api/_content/characters/output/${id}`;
    }
}
