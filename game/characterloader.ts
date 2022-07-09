import { Character } from './character';
import { RoleData } from './types';

export abstract class CharacterLoader {
    static async load(id: string): Promise<typeof Character> {
        const character = this.loadCharacterClass();
        const roleData = await this.loadCharacterRoleData(id);
        character.load(roleData);
        return character;
    }

    protected static loadCharacterClass(): typeof Character {
        return class extends Character {};
    }

    protected static async loadCharacterRoleData(
        id: string
    ): Promise<Partial<RoleData>> {
        // TODO
        const error = await new Error('Method not implemented.', id);
        throw error;
    }
}
