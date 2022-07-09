import { Clocktower } from './clocktower';
import { GamePhase } from './gamephase';
import { Seating } from './seating';

/**
 * {@link `glossary["Town Square"]`}
 * The grey cardboard sheet in the center of the seats. The Town Square has the player's life tokens and vote tokens on it, and the Traveller sheet under it.
 */
export class TownSquare {
    readonly gamePhase: GamePhase = new GamePhase();
    readonly clockTower: Clocktower = new Clocktower();

    constructor(readonly seating: Seating) {
        this.seating = seating;
    }
}
