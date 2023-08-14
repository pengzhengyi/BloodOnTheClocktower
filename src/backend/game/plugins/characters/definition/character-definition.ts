import type { RequiredCharacterDefinitionKeyNames } from './definition-keynames';

/**
 * Character definition is the unified format for defining a character
 * internally.
 */
export interface ICharacterDefinition {
    [RequiredCharacterDefinitionKeyNames.ABILITY]: string;

    [RequiredCharacterDefinitionKeyNames.EDITION]: string;

    [RequiredCharacterDefinitionKeyNames.FIRST_NIGHT]: number;

    [RequiredCharacterDefinitionKeyNames.FIRST_NIGHT_REMINDER]: string;

    [RequiredCharacterDefinitionKeyNames.ID]: string;

    [RequiredCharacterDefinitionKeyNames.NAME]: string;

    [RequiredCharacterDefinitionKeyNames.OTHER_NIGHT]: number;

    [RequiredCharacterDefinitionKeyNames.OTHER_NIGHT_REMINDER]: string;

    [RequiredCharacterDefinitionKeyNames.REMINDERS]: string[];

    [RequiredCharacterDefinitionKeyNames.SETUP]: boolean;

    [RequiredCharacterDefinitionKeyNames.TEAM]: string;

    customProperties?: Record<string, unknown>;
}
