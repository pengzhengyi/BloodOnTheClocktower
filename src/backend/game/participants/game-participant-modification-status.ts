import type { IStatus } from '../../common/utils/status';
import type { IGameParticipant } from './game-participant';
import type { GameParticipantModificationType } from './game-participant-modification-type';

/**
 * The status of a modification to participants.
 */
export interface IGameParticipantModificationStatus extends IStatus {
    readonly type: GameParticipantModificationType;

    /** The participant involved in the modification. */
    readonly participant?: IGameParticipant;
}
