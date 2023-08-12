import type { IGameSessionGuestCallbacks } from '../../actors/callbacks/game-session-guest-callbacks';
import type { IGameSessionHostCallbacks } from '../../actors/callbacks/game-session-host-callbacks';

export interface IGameSessionMembers {
    readonly host: IGameSessionHostCallbacks;
    readonly guests: IGameSessionGuestCallbacks[];
}
