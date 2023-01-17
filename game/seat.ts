import { InvalidPlayerToSit } from './exception';
import { Player } from './player';
import { GAME_UI } from './dependencies.config';

export interface SitResult {
    player: Player;
    // eslint-disable-next-line no-use-before-define
    seat: Seat;
    hasSat: boolean;
}

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

    async trySit(player: Player): Promise<SitResult> {
        if (this.isOccupied) {
            return {
                player,
                seat: this,
                hasSat: false,
            };
        } else {
            return await this.sit(player);
        }
    }

    async sit(player: Player): Promise<SitResult> {
        if (player === undefined) {
            const error = new InvalidPlayerToSit(player);
            await error.resolve();

            if (error.correctedPlayer === undefined) {
                return {
                    player,
                    seat: this,
                    hasSat: false,
                };
            }
        }

        if (
            await GAME_UI.storytellerConfirm(
                this.formatPromptForSitPlayer(player)
            )
        ) {
            this.player = player;
            player.seatNumber = this.position;
            return {
                player,
                seat: this,
                hasSat: true,
            };
        }

        return {
            player,
            seat: this,
            hasSat: false,
        };
    }

    async remove(): Promise<Player | undefined> {
        const satPlayer = this.player;
        if (
            satPlayer !== undefined &&
            (await GAME_UI.storytellerConfirm(
                this.formatPromptForRemovePlayer(satPlayer)
            ))
        ) {
            satPlayer.seatNumber = undefined;
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
