import { Player } from './player';

export class Seat {
    protected _isEmpty = true;

    player?: Player;

    constructor(public readonly position: number, player?: Player) {
        this.position = position;
        this.player = player;
    }

    get isOccupied() {
        return !this._isEmpty;
    }

    get isEmpty() {
        return this._isEmpty;
    }

    trySit(player: Player): boolean {
        if (this.isOccupied) {
            return false;
        } else {
            this._isEmpty = false;
            this.player = player;
            return true;
        }
    }

    sit(player: Player) {
        this.player = player;
        this._isEmpty = false;
    }
}
