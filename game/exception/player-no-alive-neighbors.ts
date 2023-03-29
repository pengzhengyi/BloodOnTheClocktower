import type { IPlayer } from '../player/player';
import type { ISeating } from '../seating/seating';
import { PlayerNoNeighbors } from './player-no-neighbors';

export class PlayerNoAliveNeighbors extends PlayerNoNeighbors {
    static description =
        'Cannot get two alive players that sitting nearest to the player';

    constructor(
        readonly player: IPlayer,
        readonly neighbors: [IPlayer | undefined, IPlayer | undefined],
        readonly seating: ISeating
    ) {
        super(player, neighbors, seating);
        this.message = PlayerNoAliveNeighbors.description;
    }
}
