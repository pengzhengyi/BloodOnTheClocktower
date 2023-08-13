import type { CharacterTypeKeyNames } from './definition-characters-character-type-keynames';

export interface Characters {
    [CharacterTypeKeyNames.Demons]: string[];
    [CharacterTypeKeyNames.Fabled]?: string[];
    [CharacterTypeKeyNames.Minions]: string[];
    [CharacterTypeKeyNames.Outsiders]: string[];
    [CharacterTypeKeyNames.Townsfolk]: string[];
    [CharacterTypeKeyNames.Travellers]?: string[];
}
