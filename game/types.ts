import { Player } from './player';

export type PlayerOrdering = Array<Player>;
export type Predicate<T> = (value: T) => boolean;
export const TAUTOLOGY = () => true;

export type Action = () => void;
export type Task<T = undefined> = (value: T) => void;
export type Transform<T1, T2 = T1> = (value: T1) => T2;
export type Loader<K, V> = (key: K) => V | undefined;
export type Factory<V> = () => V;

export enum RoleDataKeyName {
    /**
     * {@link `glossary["Ability"]`}
     * The special power or penalty of a character, printed on its character token, the character sheet for the chosen edition, and the character almanac for the chosen edition. The definitive text of the ability is printed in the “How to Run” section of the character almanac. Characters have no ability when dead, drunk, or poisoned.
     */
    ABILITY = 'ability',
    ABOUT = 'about',
    EDITION = 'edition',
    FIRSTNIGHT = 'firstNight',
    FIRSTNIGHTREMINDER = 'firstNightReminder',
    GAMEPLAY = 'gameplay',
    ID = 'id',
    IMAGE = 'image',
    NAME = 'name',
    OTHERNIGHT = 'otherNight',
    OTHERNIGHTREMINDER = 'otherNightReminder',
    REMINDERS = 'reminders',
    SETUP = 'setup',
    SOLILOQUY = 'soliloquy',
    TEAM = 'team',
    TIPS = 'tips',
    CUSTOM_PROPERTIES = 'custom_properties',
}

export interface RoleData {
    [RoleDataKeyName.ABILITY]: string;
    [RoleDataKeyName.ABOUT]: string;
    [RoleDataKeyName.EDITION]: string;
    [RoleDataKeyName.FIRSTNIGHT]: number;
    [RoleDataKeyName.FIRSTNIGHTREMINDER]: string;
    [RoleDataKeyName.GAMEPLAY]: Array<string>;
    [RoleDataKeyName.ID]: string;
    [RoleDataKeyName.IMAGE]: string;
    [RoleDataKeyName.NAME]: string;
    [RoleDataKeyName.OTHERNIGHT]: number;
    [RoleDataKeyName.OTHERNIGHTREMINDER]: string;
    [RoleDataKeyName.REMINDERS]: Array<string>;
    [RoleDataKeyName.SETUP]: boolean;
    [RoleDataKeyName.SOLILOQUY]: string;
    [RoleDataKeyName.TEAM]: string;
    [RoleDataKeyName.TIPS]: Record<string, string>;
    [RoleDataKeyName.CUSTOM_PROPERTIES]: Record<string, any>;
}

export enum EditionKeyName {
    CHARACTERS = 'characters',
    DESCRIPTION = 'description',
    DIFFICULTY = 'difficulty',
    GUIDE = 'guide',
    NAME = 'name',
    SYNOPSIS = 'synopsis',
    URL = 'url',
    CUSTOM_PROPERTIES = 'custom_properties',
}

export interface EditionData {
    [EditionKeyName.CHARACTERS]: Record<string, Array<string>>;
    [EditionKeyName.DESCRIPTION]: string;
    [EditionKeyName.DIFFICULTY]: string;
    [EditionKeyName.GUIDE]: Record<string, string>;
    [EditionKeyName.NAME]: string;
    [EditionKeyName.SYNOPSIS]: string;
    [EditionKeyName.URL]: string;
    [RoleDataKeyName.CUSTOM_PROPERTIES]: Record<string, string>;
}

export enum Direction {
    Clockwise,
    Counterclockwise,
}

export interface Allocation<T> {
    key: T;
    desiredNumber?: number;
    isStrictUpperbound?: boolean;
}

export type Prioritization<T> = Iterable<Allocation<T>>;

export type ScriptCharacter = Record<RoleDataKeyName.ID, string>;

/**
 * {@link `glossary["Script"]`}
 * A collection of characters, created via the Script Tool, that can be printed to make character sheets.
 */
export type Script = Array<ScriptCharacter>;
