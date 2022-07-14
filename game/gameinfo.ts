import { Players } from './players';
import { CharacterSheet } from './charactersheet';
import { Player } from './player';

export class GameInfo {
    private readonly _players;

    get players(): Players {
        return new Players(this._players, [], false);
    }

    constructor(players: Array<Player>, characterSheet: CharacterSheet) {
        this._players = players;
        this.characterSheet = characterSheet;
    }
}

export interface GameInfo {
    players: Players;
    characterSheet: CharacterSheet;
}
