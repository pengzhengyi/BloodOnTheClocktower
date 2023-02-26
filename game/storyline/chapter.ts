import type { IGamePhase } from '../game-phase';
import type { IAct } from './act';

/**
 * A chapter is a collection of acts during a particular game phase.
 */
export interface IChapter extends IAct {
    readonly acts: IAct[];

    readonly gamePhase: IGamePhase;
}
