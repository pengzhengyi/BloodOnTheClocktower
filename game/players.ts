import { CharacterType } from './charactertype';
import { Generator } from './collections';
import { PlayerNotSat } from './exception';
import { Player } from './player';
import { Neighbor } from './types';

export class Players extends Generator<Player> {
    static alGood(iterable: Iterable<Player>): boolean {
        return Generator.every((player) => player.isGood, iterable);
    }

    static allEvil(iterable: Iterable<Player>): boolean {
        return Generator.every((player) => player.isEvil, iterable);
    }

    isMinion() {
        return this.filter((player) => player.character.isMinion);
    }

    isDemon() {
        return this.filter((player) => player.character.isDemon);
    }

    isTownsfolk() {
        return this.filter((player) => player.character.isTownsfolk);
    }

    isOutsider() {
        return this.filter((player) => player.character.isOutsider);
    }

    isFabled() {
        return this.filter((player) => player.character.isFabled);
    }

    isCharacterType(characterType: typeof CharacterType) {
        return this.filter((player) =>
            player.character.isCharacterType(characterType)
        );
    }

    *getNeighbors(): Iterable<Neighbor> {
        const reorderedPlayers: Array<Player> = [];

        for (const player of this) {
            // distance 1 neighbor
            const seatNumber = player.seatNumber;

            if (seatNumber === undefined) {
                throw new PlayerNotSat(player);
            }

            reorderedPlayers[seatNumber] = player;

            const prevNeighbor = reorderedPlayers[seatNumber - 1];
            if (prevNeighbor !== undefined) {
                yield [prevNeighbor, player];
            }

            const nextNeighbor = reorderedPlayers[seatNumber + 1];
            if (nextNeighbor !== undefined) {
                yield [player, nextNeighbor];
            }
        }

        const largestSeatNumber = reorderedPlayers.length - 1;
        if (largestSeatNumber > 1) {
            yield [reorderedPlayers[0], reorderedPlayers[largestSeatNumber]];
        }

        this.transform((_) => reorderedPlayers);
    }
}
