import type { Execution } from './execution';
import type { IGame } from './game';
import type { IPlayer } from './player';
import type {
    Minion,
    Demon,
    Townsfolk,
    CharacterType,
} from './character/character-type';
import type { CharacterToken } from './character/character';
import type { Phase } from './phase';
import type { Butler } from '~/content/characters/output/butler';
import type { Drunk } from '~/content/characters/output/drunk';
import type { FortuneTeller } from '~/content/characters/output/fortuneteller';
import type { Mayor } from '~/content/characters/output/mayor';
import type { Monk } from '~/content/characters/output/monk';
import type { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import type { Recluse } from '~/content/characters/output/recluse';
import type { Saint } from '~/content/characters/output/saint';
import type { Slayer } from '~/content/characters/output/slayer';
import type { Soldier } from '~/content/characters/output/soldier';
import type { Undertaker } from '~/content/characters/output/undertaker';
import type { Virgin } from '~/content/characters/output/virgin';
import type { Imp } from '~/content/characters/output/imp';
import type { Poisoner } from '~/content/characters/output/poisoner';
import type { Spy } from '~/content/characters/output/spy';
import type { Chef } from '~/content/characters/output/chef';
import type { Empath } from '~/content/characters/output/empath';
import type { ScarletWoman } from '~/content/characters/output/scarletwoman';

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

export type FortuneTellerPlayer = IPlayer & {
    character: Promise<FortuneTeller>;
};

export type EmpathPlayer = IPlayer & {
    character: Promise<Empath>;
};

export type ChefPlayer = IPlayer & {
    character: Promise<Chef>;
};

export type MonkPlayer = IPlayer & {
    character: Promise<Monk>;
};

export type RavenkeeperPlayer = IPlayer & {
    character: Promise<Ravenkeeper>;
};

export type VirginPlayer = IPlayer & {
    character: Promise<Virgin>;
};

export type SlayerPlayer = IPlayer & {
    character: Promise<Slayer>;
};

export type SoldierPlayer = IPlayer & {
    character: Promise<Soldier>;
};

export type MayorPlayer = IPlayer & {
    character: Promise<Mayor>;
};

export type ButlerPlayer = IPlayer & {
    character: Promise<Butler>;
};

export type UndertakerPlayer = IPlayer & {
    character: Promise<Undertaker>;
};

export type ReclusePlayer = IPlayer & {
    character: Promise<Recluse>;
};

export type SaintPlayer = IPlayer & {
    character: Promise<Saint>;
};

export type DrunkPlayer = IPlayer & {
    character: Promise<Drunk>;
};

export type PoisonerPlayer = IPlayer & {
    character: Promise<Poisoner>;
};

export type SpyPlayer = IPlayer & {
    character: Promise<Spy>;
};

export type ScarletWomanPlayer = IPlayer & {
    character: Promise<ScarletWoman>;
};

export type ImpPlayer = IPlayer & {
    character: Promise<Imp>;
};

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
    execution: Execution;
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

export interface IBindToCharacter {
    origin: CharacterToken;
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
