import type { IGameParticipant } from './game-participant';
import type { GameParticipantType } from './game-participant-type';

/**
 * Player represents a participant in a game session who is playing the game.
 */
export interface IPlayer extends IGameParticipant {
    readonly type: GameParticipantType.Player;
}
