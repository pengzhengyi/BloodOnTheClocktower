import type { ITimeEvent } from '../../common/interfaces/time-event';
import type { WithId } from '../../common/interfaces/with-id';

/**
 * Basic information of a game session.
 */
export interface IGameSessionInfo extends WithId, ITimeEvent {}
