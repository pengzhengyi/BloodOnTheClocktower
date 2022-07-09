import { Character } from './character';
import { RoleData } from './types';

export abstract class CharacterLoader {
    static load(id: string): typeof Character {
        const character = this.loadCharacter(id);
        const roleData = this.loadCharacterRoleData(id);
        character.load(roleData);
        return character;
    }

    protected static loadCharacter(id: string): typeof Character {
        // TODO
        throw new Error('Method not implemented.', id);
    }

    protected static loadCharacterRoleData(id: string): Partial<RoleData> {
        // TODO
        throw new Error('Method not implemented.', id);
    }
}
