import type { Players } from './players';

/**
 * {@link `glossary["Grimoire"]`}
 * The box that stores the Clocktower pieces, held and updated by the Storyteller. Players cannot look in the Grimoire. The Grimoire shows the actual states of all the characters, such as who is alive or dead, who is poisoned, who is acting at night, etc.
 */
export class Grimoire {
    protected readonly players: Players;

    constructor(players: Players) {
        this.players = players;
    }
}
