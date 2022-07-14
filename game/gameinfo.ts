import { Players } from './players';
import { CharacterSheet } from './charactersheet';
import { Player } from './player';

type UnderlyingPlayers = Array<Player>;

export class GameInfo {
    private _players: UnderlyingPlayers;

    get players(): Players {
        return new Players(this._players, [], false);
    }

    constructor(
        players: UnderlyingPlayers,
        public characterSheet: CharacterSheet
    ) {
        this._players = players;
        this.characterSheet = characterSheet;
    }
}
