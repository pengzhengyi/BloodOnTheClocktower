import type { IExecution } from './voting/execution';
import type { IGame } from './game';
import type { IPlayer } from './player';
import type {
    Minion,
    Demon,
    Townsfolk,
    CharacterType,
    Traveller,
} from './character/character-type';
import type { CharacterToken } from './character/character';
import type { Phase } from './phase';
import type { InfoType } from './info/info-type';
import type { ICharacterSheet } from './character/character-sheet';
import type { NumberOfCharacters } from './script-tool';
import type { CharacterId } from './character/character-id';
import type { IPlayers } from './players';
import type { IAbilities } from './ability/abilities';

export type NoParamConstructor<T> = { new (): T };
export type Constructor<T> = { new (...args: any[]): T };
export type StaticThis<T> = Constructor<T>;

export type IterableLike<T> =
    | Iterator<T>
    | Iterable<T>
    | AsyncIterable<T>
    | AsyncIterator<T>;

export type PlayerOrdering = Array<IPlayer>;
export type Predicate<T> = (value: T) => boolean;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type AnyPredicate<T> = Predicate<T> | AsyncPredicate<T>;
export const TAUTOLOGY = () => true;

export type Action = () => void;
export type Task<T = undefined> = (value: T) => void;
export type AsyncTask<T = undefined> = (value: T) => Promise<void>;
export type Transform<T1, T2 = T1> = (value: T1) => T2;
export type AsyncTransform<T1, T2 = T1> = (value: T1) => Promise<T2>;
export type AnyTransform<T1, T2 = T1> =
    | Transform<T1, T2>
    | AsyncTransform<T1, T2>;
export type Reducer<T1, T2> = (previousValue: T1, currentValue: T2) => T1;
export type AsyncReducer<T1, T2> = (
    previousValue: Promise<T1>,
    currentValue: Promise<T2>
) => Promise<T1>;
export type Loader<K, V> = (key: K) => V | undefined;
export type Factory<V> = () => V;
export type AsyncFactory<V> = () => Promise<V>;
export type AnyFactory<V> = Factory<V> | AsyncFactory<V>;

export type ResolveCallback<T> = (value: T | PromiseLike<T>) => void;
export type RejectCallback = (reason?: any) => void;

export type TJSON =
    | string
    | number
    | boolean
    | null
    | TJSON[]
    | { [key: string]: TJSON };

/**
 * Generate a random integer r with equal chance in  min <= r <= max.
 */
export type TRandomRange = (min: number, max: number) => number;

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
    [RoleDataKeyName.CUSTOM_PROPERTIES]: Record<string, unknown>;
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

/**
 * Two players, where one player is sitting one seat clockwise and counterclockwise from the other player.
 */
export type Neighbor = [IPlayer, IPlayer];

export type AnyObject = Record<string, any>;

export interface RequirePhase {
    phase: Phase;
}

export interface RequireGame {
    game: IGame;
}

export interface RequireReason {
    readonly reason: string;
}

export interface RequireExecution {
    execution: IExecution;
}

export interface RequireInfoType {
    readonly infoType: InfoType;
}

export type MinionPlayer = IPlayer & {
    characterType: Promise<Minion>;
};
export type DemonPlayer = IPlayer & {
    characterType: Promise<Demon>;
};
export type TownsfolkPlayer = IPlayer & {
    characterType: Promise<Townsfolk>;
};
export type TravellerPlayer = IPlayer & {
    characterType: Promise<Traveller>;
};

export interface IBindToCharacter {
    origin: CharacterId;
}

export interface IBindToCharacterType {
    origin: typeof CharacterType;
}

export interface ISingleton<T> {
    getInstance(): T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEnvironment {}

export interface IEnvironmentProvider<TEnvironment extends IEnvironment> {
    readonly current: TEnvironment;
}

export interface ICharacterTypeToCharacter {
    minion: Array<CharacterToken>;
    demon: Array<CharacterToken>;
    townsfolk: Array<CharacterToken>;
    outsider: Array<CharacterToken>;
    traveller: Array<CharacterToken>;
    fabled: Array<CharacterToken>;
}

export interface IDecideInPlayCharactersContext {
    characterSheet: ICharacterSheet;
    numToChooseForEachCharacterType: NumberOfCharacters;
}

export interface IDecideCharacterAssignmentsContext {
    players: IPlayers;
    inPlayCharacters: ICharacterTypeToCharacter;
}

export interface CharacterAssignment {
    player: IPlayer;

    character: CharacterToken;
}

export interface AbilityAssignment {
    player: IPlayer;

    abilities: IAbilities;
}

export interface CharacterAssignmentResult extends CharacterAssignment {
    result: boolean;
}
