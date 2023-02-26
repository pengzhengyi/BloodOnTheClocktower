import type { IGame } from '../game';

/**
 * An act is the smallest component of a storyline (or less figuratively, an act is an event in the Blood on the Clocktower game). It can be anything from a character’s ability at night to an execution on the day.
 */
export interface IAct {
    act(game: IGame): Promise<void>;

    toString(): string;
}
