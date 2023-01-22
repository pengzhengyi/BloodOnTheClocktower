import { InvalidPlayerToSit } from './exception';
import type { IPlayer } from './player';
import { Environment } from '~/interaction/environment';

export interface SitResult {
    player: IPlayer;
    // eslint-disable-next-line no-use-before-define
    seat: Seat;
    hasSat: boolean;
}

export class Seat {
    player?: IPlayer;

    static async init(position: number, player: IPlayer) {
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

    async trySit(player: IPlayer): Promise<SitResult> {
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

    async sit(player: IPlayer): Promise<SitResult> {
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
            await Environment.current.gameUI.storytellerConfirm(
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

    async remove(): Promise<IPlayer | undefined> {
        const satPlayer = this.player;
        if (
            satPlayer !== undefined &&
            (await Environment.current.gameUI.storytellerConfirm(
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

    protected formatPromptForSitPlayer(player: IPlayer): string {
        return `Allow ${player.toString()} to sit at ${this.toString()}`;
    }

    protected formatPromptForRemovePlayer(player: IPlayer): string {
        return `Remove ${player.toString()} from ${this.toString()}`;
    }
}
