import type { RequiredEditionDefinitionKeyNames } from './definition-keynames';
import type { Characters } from './definition-characters';

/**
 * Edition definition is the unified format for defining a game edition
 * internally.
 */
export interface IEditionDefinition {
    [RequiredEditionDefinitionKeyNames.NAME]: string;

    [RequiredEditionDefinitionKeyNames.CHARACTERS]: Characters;

    customProperties?: Record<string, unknown>;
}
