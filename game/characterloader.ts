import { Character } from './character';
import { RoleData } from './types';
import { ID_TO_CHARACTER } from '~/content/characters/output/characters';

export abstract class CharacterLoader {
    static load(id: string): typeof Character | undefined {
        return ID_TO_CHARACTER.get(id);
    }

    protected static loadWithRoleData(roleData: Partial<RoleData>) {
        const character = this.loadCharacterClass();
        character.initialize(roleData);
        return character;
    }

    protected static loadCharacterClass(): typeof Character {
        return class extends Character {};
    }
}
