import { Character } from './character';
import { RoleData } from './types';
import { NoCharacterMatchingId } from './exception';
import { ID_TO_CHARACTER } from '~/content/characters/output/characters';

export abstract class CharacterLoader {
    static load(id: string): typeof Character {
        const character = ID_TO_CHARACTER.get(id);
        if (character === undefined) {
            throw new NoCharacterMatchingId(id);
        }
        return character;
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
        // TODO
        const error = await new Error('Method not implemented.', id);
        throw error;
    }
}
