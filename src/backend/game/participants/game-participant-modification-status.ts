import type { WithStatus } from '../../common/interfaces/with-status';
import type { IGameParticipant } from './game-participant';
import type { GameParticipantModificationType } from './game-participant-modification-type';

/**
 * The status of a modification to participants.
 */
export interface IGameParticipantModificationStatus extends WithStatus {
    readonly type: GameParticipantModificationType;

    /** The participant involved in the modification. */
    readonly participant?: IGameParticipant;
}
