import type { IGameParticipant } from './game-participant';
import type { GameParticipantType } from './game-participant-type';

/**
 * Storyteller represents a participant in a game session who is responsible for running the game.
 */
export interface IStoryteller extends IGameParticipant {
    readonly type: GameParticipantType.Storyteller;
}
