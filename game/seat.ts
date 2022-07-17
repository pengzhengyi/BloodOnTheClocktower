import { Player } from './player';

export class Seat {
    protected _isEmpty = true;

    player?: Player;

    constructor(public readonly position: number) {
        this.position = position;
    }

    get isOccupied() {
        return !this._isEmpty;
    }

    get isEmpty() {
        return this._isEmpty;
    }

    trySit(): boolean {
        if (this.isOccupied) {
            return false;
        } else {
            this._isEmpty = false;
            return true;
        }
    }

    sit() {
        this._isEmpty = true;
    }
}
