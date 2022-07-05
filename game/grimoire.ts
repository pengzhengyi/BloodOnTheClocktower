import { Character } from './character';
import { Player } from './player';

/**
 * {@link `glossory["Grimoire"]`}
 * The box that stores the Clocktower pieces, held and updated by the Storyteller. Players cannot look in the Grimoire. The Grimoire shows the actual states of all the characters, such as who is alive or dead, who is poisoned, who is acting at night, etc.
 */
export class Grimoire {
    private _players: Array<Player> = [];
    charactersInPlay: Set<Character> = new Set();

    get players(): Array<Player> {
        return this._players;
    }

    constructor(players: Iterable<Player>) {
        this.initialize(players);
    }

    /**
     * {@link `glossory["In play"]`}
     * A character that exists in the current game, either alive or dead.
     * @param character A character to check.
     */
    isInPlay(character: Character): boolean {
        return this.charactersInPlay.has(character);
    }

    /**
     * ! When a new player is added or an existing player is removed, this method must be called to recompute the state.
     * @param players Updated players.
     */
    reinitialize(players: Iterable<Player>) {
        this.initialize(players);
    }

    protected initialize(players: Iterable<Player>) {
        this._players = [];
        this.charactersInPlay.clear();

        for (const player of players) {
            this._players.push(player);
            this.charactersInPlay.add(player.character);
        }
    }
}
