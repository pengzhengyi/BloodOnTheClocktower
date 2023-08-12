import type { CanAbortGame } from './actions/abort/can-abort-game';
import type { CanEndGame } from './actions/end/can-end-game';
import type { CanSetupGame } from './actions/setup/can-setup-game';
import type { CanStartGame } from './actions/start/can-start-game';
import type { IGameInfo } from './game-info';
import type { IGameParticipants } from './participants/game-participants';
import type { GameStateType } from './states/game-state-type';

export interface IGame
    extends CanAbortGame,
        CanSetupGame,
        CanStartGame,
        CanEndGame {
    /**
     * Basic information of a game like game id and creation time.
     */
    readonly info: IGameInfo;

    readonly stateType: GameStateType;

    readonly participants: IGameParticipants;
}
