import { Generator } from './collections';
import { type IPlayer, type IPlayerInfo, Player } from './player/player';
import type { IPlayers } from './player/players';
import { iterableToString } from '~/utils/common';

export interface IGrimoire {
    getPlayerActualInfo(player: IPlayer): IPlayerInfo;

    toString(): string;
}

/**
 * {@link `glossary["Grimoire"]`}
 * The box that stores the Clocktower pieces, held and updated by the Storyteller. Players cannot look in the Grimoire. The Grimoire shows the actual states of all the characters, such as who is alive or dead, who is poisoned, who is acting at night, etc.
 */
export class Grimoire implements IGrimoire {
    protected readonly players: IPlayers;

    constructor(players: IPlayers) {
        this.players = players;
    }

    getPlayerActualInfo(player: IPlayer): IPlayerInfo {
        return {
            id: player.id,
            username: player.username,
            seatNumber: player.seatNumber,
            state: player.storytellerGet('_state'),
            character: player.storytellerGet('_character'),
            alignment: player.storytellerGet('_alignment'),
        };
    }

    toString(): string {
        return iterableToString(
            Generator.map(
                (player) => Player.format(this.getPlayerActualInfo(player)),
                this.players
            ),
            'Players'
        );
    }
}
