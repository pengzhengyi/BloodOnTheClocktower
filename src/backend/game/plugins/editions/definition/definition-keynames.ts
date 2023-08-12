/**
 * Enum for the key names of required edition definition properties.
 */
export enum RequiredEditionDefinitionKeyNames {
    NAME = 'name',
    CHARACTERS = 'characters',
}

/**
 * Enum for the key names of optional edition definition properties.
 * These properties are recognized by the game engine, but are not required.
 *
 * For example, the `description` property is optional but when a game edition
 * has a `description` property, the game ui will display the description.
 */
export enum OptionalEditionDefinitionKeyNames {
    DESCRIPTION = 'description',
    DIFFICULTY = 'difficulty',
    GUIDE = 'guide',
    SYNOPSIS = 'synopsis',
    URL = 'url',
}
