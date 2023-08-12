import type { CharacterId } from '../characters/id/character-id';
import { RequiredEditionDefinitionKeyNames } from './definition/definition-keynames';
import type { IEditionDefinition } from './definition/edition-definition';
import type { IEdition } from './edition';
import type { EditionId } from './id/edition-id';

export class EditionFromDefinition implements IEdition {
    readonly id: string;

    readonly definition: IEditionDefinition;

    get name(): string {
        return this.definition[RequiredEditionDefinitionKeyNames.NAME];
    }

    get characters(): CharacterId[] {
        return this.definition[RequiredEditionDefinitionKeyNames.CHARACTERS];
    }

    constructor(id: EditionId, definition: IEditionDefinition) {
        this.id = id;
        this.definition = definition;
    }
}
