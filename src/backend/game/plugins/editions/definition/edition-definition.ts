import type { RequiredEditionDefinitionKeyNames } from './definition-keynames';

/**
 * Edition definition is the unified format for defining a game edition
 * internally.
 *
 * Editions in other formats (e.g. JSON) are converted to this definition.
 */
export interface IEditionDefinition {
    [RequiredEditionDefinitionKeyNames.NAME]: string;

    [RequiredEditionDefinitionKeyNames.CHARACTERS]: string[];

    customProperties?: Record<string, unknown>;
}
