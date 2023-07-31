import type { IParticipantModificationStatus } from './participant-modification-status';
import type { IPlayer } from './player';
import type { IStoryteller } from './storyteller';

/**
 * Participants is a collection of all the participants (actors) in a game session.
 *
 * It supports management of participants, such as adding and removing participants.
 */
export interface IParticipants {
    readonly count: number;
    readonly numPlayers: number;

    readonly storyteller?: IStoryteller;
    readonly players: Array<IPlayer>;

    readonly hasStoryteller: boolean;

    addStoryteller(
        storyteller: IStoryteller
    ): Promise<IParticipantModificationStatus>;
    removeStoryteller(): Promise<IParticipantModificationStatus>;

    addPlayer(player: IPlayer): Promise<IParticipantModificationStatus>;
    removePlayer(player: IPlayer): Promise<IParticipantModificationStatus>;
}
