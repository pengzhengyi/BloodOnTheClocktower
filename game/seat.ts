import { Player } from './player';

export class Seat {
    player?: Player;

    constructor(public readonly position: number) {
        this.position = position;
    }

    get sat(): boolean {
        return this.player !== undefined;
    }

    trySit(player: Player): boolean {
        if (this.player === undefined) {
            this.player = player;
            return true;
        } else {
            return false;
        }
    }

    sit(player: Player): Player | undefined {
        const playerOut = this.player;
        this.player = player;
        return playerOut;
    }
}
