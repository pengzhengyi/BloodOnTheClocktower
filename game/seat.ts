import { Player } from './player';
import { GAME_UI } from '~/interaction/gameui';

export class Seat {
    player?: Player;

    static async init(position: number, player: Player) {
        const seat = new this(position);
        await seat.sit(player);
        return seat;
    }

    constructor(public readonly position: number) {
        this.position = position;
    }

    get isOccupied() {
        return !this.isEmpty;
    }

    get isEmpty() {
        return this.player === undefined;
    }

    async trySit(player: Player): Promise<boolean> {
        if (this.isOccupied) {
            return false;
        } else {
            return await this.sit(player);
        }
    }

    async sit(player: Player): Promise<boolean> {
        if (
            await GAME_UI.storytellerConfirm(
                this.formatPromptForSitPlayer(player)
            )
        ) {
            this.player = player;
            player.seatNumber = this.position;
            return true;
        }

        return false;
    }

    async remove(): Promise<Player | undefined> {
        const satPlayer = this.player;
        if (
            satPlayer !== undefined &&
            (await GAME_UI.storytellerConfirm(
                this.formatPromptForRemovePlayer(satPlayer)
            ))
        ) {
            satPlayer.seatNumber = 0;
            this.player = undefined;
            return satPlayer;
        }
    }

    toString() {
        return `Seat ${this.position}`;
    }

    protected formatPromptForSitPlayer(player: Player): string {
        return `Allow ${player.toString()} to sit at ${this.toString()}`;
    }

    protected formatPromptForRemovePlayer(player: Player): string {
        return `Remove ${player.toString()} from ${this.toString()}`;
    }
}
