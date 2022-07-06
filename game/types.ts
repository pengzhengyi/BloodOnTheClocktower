import { Alignment } from './alignment';
import { Player } from './player';

export type PlayerOrdering = Array<Player>;
export type Predicate<T> = (value: T) => boolean;
export const TAUTOLOGY = () => true;

export type Action<T = undefined> = (() => void) | ((value: T) => void);

export enum RoleDataKeyName {
    /**
     * {@link `glossory["Ability"]`}
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

export enum Direction {
    Clockwise,
    Counterclockwise,
}

export interface WithStartsAsAlignment {
    readonly alignmentStartsAs: Alignment;
}

export type ScriptCharacter = Record<RoleDataKeyName.ID, string>;

/**
 * {@link `glossory["Script"]`}
 * A collection of characters, created via the Script Tool, that can be printed to make character sheets.
 */
export type Script = Array<ScriptCharacter>;
