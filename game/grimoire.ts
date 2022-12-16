import { Character } from './character';
import { Player } from './player';
import { Players } from './players';

/**
 * {@link `glossary["Grimoire"]`}
 * The box that stores the Clocktower pieces, held and updated by the Storyteller. Players cannot look in the Grimoire. The Grimoire shows the actual states of all the characters, such as who is alive or dead, who is poisoned, who is acting at night, etc.
 */
export class Grimoire {
    private _players!: Players;

    charactersInPlay: Set<Character> = new Set();

    get players(): Players {
        return this._players.reset();
    }

    constructor(players: Iterable<Player>) {
        this.initialize(players);
    }

    /**
     * {@link `glossary["In play"]`}
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
        const _players = [];
        this.charactersInPlay.clear();

        for (const player of players) {
            _players.push(player);
            this.charactersInPlay.add(player.character);
        }

        this._players = new Players(_players);
    }
}
