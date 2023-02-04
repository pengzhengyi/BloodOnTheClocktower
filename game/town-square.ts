import { type IClocktower } from './clocktower';
import { type ISeating } from './seating/seating';

export interface ResitResult {
    oldSeating: ISeating;
    newSeating: ISeating;
}

export interface ITownSquare {
    readonly clockTower: IClocktower;
    readonly seating: ISeating;
}

/**
 * {@link `glossary["Town Square"]`}
 * The grey cardboard sheet in the center of the seats. The Town Square has the player's life tokens and vote tokens on it, and the Traveller sheet under it.
 */
export class TownSquare implements ITownSquare {
    readonly clockTower: IClocktower;
    readonly seating: ISeating;

    constructor(seating: ISeating, clockTower: IClocktower) {
        this.seating = seating;
        this.clockTower = clockTower;
    }
}
