import type { IGameParticipantModificationStatus } from './game-participant-modification-status';
import type { IPlayer } from './player';
import type { IStoryteller } from './storyteller';

/**
 * Game Participants is a collection of all the game participants in a game session.
 *
 * It supports management of participants, such as adding and removing participants.
 */
export interface IGameParticipants {
    readonly count: number;
    readonly numPlayers: number;

    readonly storyteller?: IStoryteller;
    readonly players: Array<IPlayer>;

    readonly hasStoryteller: boolean;

    addStoryteller(
        storyteller: IStoryteller
    ): Promise<IGameParticipantModificationStatus>;
    removeStoryteller(): Promise<IGameParticipantModificationStatus>;

    addPlayer(player: IPlayer): Promise<IGameParticipantModificationStatus>;
    removePlayer(player: IPlayer): Promise<IGameParticipantModificationStatus>;
}
