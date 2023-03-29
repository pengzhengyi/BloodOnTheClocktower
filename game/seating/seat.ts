import type { IPlayer } from '../player/player';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface SitResult {
    player: IPlayer;
    // eslint-disable-next-line no-use-before-define
    seat: ISeat;
    hasSat: boolean;
}

export interface ISeat {
    readonly player?: IPlayer;
    readonly position: number;
    readonly isOccupied: boolean;
    readonly isEmpty: boolean;

    /**
     * These are four scenarios when trying to sit a player to a seat, depending on whether the player is already assigned a seat and whether the seat is already occupied.
     *
     * - Assigned Player and Occupied Seat
     * - Assigned Player and Unoccupied Seat
     * - Unassigned Player and Occupied Seat
     * - Unassigned Player and Unoccupied Seat
     *
     * `trySit` will only succeed for the last case: when an unassigned player try to sit an unoccupied Seat.
     *
     * Try to sit a player to current seat. Will fail immediately when the seat is occupied.
     * @param player A player attempt to sit.
     * @returns The result of sitting.
     */
    trySit(player: IPlayer): SitResult;
    /**
     * These are four scenarios when trying to sit a player to a seat, depending on whether the player is already assigned a seat and whether the seat is already occupied.
     *
     * - Assigned Player and Occupied Seat
     * - Assigned Player and Unoccupied Seat
     * - Unassigned Player and Occupied Seat
     * - Unassigned Player and Unoccupied Seat
     *
     * For the last case, when an unassigned player try to sit an unoccupied, `sit` will behave like `trySit`. For the second to last, `sit` might require confirmation for emptying an occupied seat, making this call asynchronous.
     *
     * ! For the first two scenario, `sit` does not guarantee removing a player from its existing assigned seat. `ISeating.sit` should be used instead as it does proper cleaning up. In fact, `ISeating.sit` should be preferred when possible as the safer alternative.
     *
     * Sit a player at current seat. If the seat is occupied, will try to remove sat player before sit the new player.
     * @param player A player attempt to sit.
     * @returns The result of sitting.
     */
    sit(player: IPlayer): Promise<SitResult>;
    /**
     * Remove sat player (if any) from current seat.
     * @returns The previous sat player or undefined if the seat is empty.
     */
    remove(): Promise<IPlayer | undefined>;
    toString(): string;
}

export class Seat implements ISeat {
    readonly position: number;

    get isOccupied() {
        return !this.isEmpty;
    }

    get isEmpty() {
        return this.player === undefined;
    }

    get player(): IPlayer | undefined {
        return this._player;
    }

    protected _player?: IPlayer;

    constructor(position: number) {
        this.position = position;
    }

    trySit(player: IPlayer): SitResult {
        if (this.isEmpty && player.seatNumber === undefined) {
            return this.sitWhenEmpty(player);
        } else {
            return this.getFailToSitResult(player);
        }
    }

    async sit(player: IPlayer): Promise<SitResult> {
        if (this.isOccupied) {
            if (player.seatNumber === this.position) {
                // short circuit when player is already at desired seat
                return this.getSucceedToSitResult(player);
            }

            const removedPlayer = await this.remove();
            if (removedPlayer === undefined) {
                return this.getFailToSitResult(player);
            }
        }

        return this.sitWhenEmpty(player);
    }

    async remove(): Promise<IPlayer | undefined> {
        const satPlayer = this.player;
        if (satPlayer === undefined) {
            return;
        }

        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                this.formatPromptForRemovePlayer(satPlayer)
            )
        ) {
            return this.removeSatPlayer(satPlayer);
        }
    }

    toString() {
        const sitPlayerString = this.player?.toString() ?? '';
        return `Seat ${this.position}(${sitPlayerString})`;
    }

    protected formatPromptForSitPlayer(player: IPlayer): string {
        return `Allow ${player} to sit at ${this}`;
    }

    protected formatPromptForRemovePlayer(player: IPlayer): string {
        return `Remove ${player} from ${this}`;
    }

    protected sitWhenEmpty(player: IPlayer): SitResult {
        this._player = player;
        player.seatNumber = this.position;
        return this.getSucceedToSitResult(player);
    }

    protected removeSatPlayer(satPlayer: IPlayer): IPlayer {
        satPlayer.seatNumber = undefined;
        this._player = undefined;
        return satPlayer;
    }

    protected getSucceedToSitResult(player: IPlayer): SitResult {
        return {
            player,
            seat: this,
            hasSat: true,
        };
    }

    protected getFailToSitResult(player: IPlayer): SitResult {
        return {
            player,
            seat: this,
            hasSat: false,
        };
    }
}
