import { Players } from './players';
import { CharacterSheet } from './charactersheet';
import { Player } from './player';
import { Seating } from './seating';

type UnderlyingPlayers = Array<Player>;

export class GameInfo {
    private _players: UnderlyingPlayers;

    get players(): Players {
        return new Players(this._players, [], false);
    }

    getSeating(): Promise<Seating> {
        return Seating.from(this._players);
    }

    constructor(
        players: UnderlyingPlayers,
        public characterSheet: CharacterSheet
    ) {
        this._players = players;
        this.characterSheet = characterSheet;
    }
}
