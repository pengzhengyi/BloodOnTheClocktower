import type { CharacterId } from '../characters/id/character-id';
import type { IEditionDefinition } from './definition/edition-definition';
import type { EditionId } from './id/edition-id';

export interface IEdition {
    readonly id: EditionId;

    readonly definition: IEditionDefinition;

    readonly name: string;

    readonly characters: CharacterId[];
}
