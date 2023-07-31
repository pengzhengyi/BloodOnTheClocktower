import type { IStatus } from '../common/utils/status';
import type { IActor } from './actor';
import type { IParticipantModificationType } from './participant-modification-type';

/**
 * The status of a modification to participants.
 */
export interface IParticipantModificationStatus extends IStatus {
    readonly type: IParticipantModificationType;

    /** The participant involved in the modification. */
    readonly participant?: IActor;
}
