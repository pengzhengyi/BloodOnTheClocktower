import axios, { AxiosRequestConfig } from 'axios';
import { Character } from './character';
import { CharacterLoadFailure, NoCharacterMatchingId } from './exception';
import type { RoleData } from './types';
import { ID_TO_CHARACTER } from '~/content/characters/output/characters';

export abstract class CharacterLoader {
    static load(id: string): typeof Character {
        const character = this.tryLoad(id);
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }
        return character;
    }

    static tryLoad(id: string): typeof Character | undefined {
        return ID_TO_CHARACTER.get(Character.getCanonicalId(id));
    }

    static async loadAsync(id: string): Promise<typeof Character> {
        const roleData = await this.loadCharacterRoleDataAsync(id);
        return this.loadWithRoleData(roleData);
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
