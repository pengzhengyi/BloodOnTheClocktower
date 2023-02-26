import type { IGame } from '../game';
import type { IGamePhase } from '../game-phase';
import type { IAct } from './act';
import type { IChapter } from './chapter';

export interface IStoryline extends IAct {
    readonly pastChapters: IChapter[];
    readonly currentChapter: IChapter;

    draftChapter(game: IGame, gamePhase: IGamePhase): Promise<IChapter>;
}
