import { Player } from './player';

export type PlayerOrdering = Array<Player>;
export type Predicate<T> = (value: T) => boolean;

export enum RoleDataKeyName {
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
