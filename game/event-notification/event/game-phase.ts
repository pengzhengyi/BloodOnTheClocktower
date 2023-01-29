import type { IEvent } from '../types';
import type { IGamePhase } from '~/game/game-phase';

export interface IGamePhaseEvent extends IEvent {
    readonly gamePhase: IGamePhase;
}

export class GamePhaseEvent implements IGamePhaseEvent {
    gamePhase: IGamePhase;

    constructor(gamePhase: IGamePhase) {
        this.gamePhase = gamePhase;
    }

    toString(): string {
        return `at ${this.gamePhase}`;
    }
}
