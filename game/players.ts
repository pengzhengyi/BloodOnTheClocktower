import type { Alignment } from './alignment';
import { CharacterType } from './charactertype';
import { Generator } from './collections';
import { PlayerNotSat } from './exception';
import { Player } from './player';

export class Players extends Generator<Player> {
    static of(...players: Array<Player>) {
        return new this(players);
    }

    static alGood(iterable: Iterable<Player>): boolean {
        return Generator.every((player) => player.isGood, iterable);
    }

    static allEvil(iterable: Iterable<Player>): boolean {
        return Generator.every((player) => player.isEvil, iterable);
    }

    /**
     * {@link `glossary["Team"]`}
     * All players sharing an alignment. “Your team” means “You and all other players that have the same alignment as you.”
     *
     * @param players Players to find teammates in.
     */
    static getTeam(players: Iterable<Player>): Map<Alignment, Array<Player>> {
        return Generator.groupBy(players, (player) => player.alignment);
    }

    protected readonly players: Array<Player>;

    constructor(players: Array<Player>) {
        super(players, [], false);
        this.players = players;
    }

    filterById(playerId: string) {
        return this.filter((player) => player.id === playerId);
    }

    filterByIds(playerIds: Set<string>) {
        if (playerIds.size === 0) {
            return Players.empty() as Players;
        }

        return this.filter((player) => playerIds.has(player.id));
    }

    intersect(players?: Iterable<Player>) {
        if (players === undefined) {
            return Players.empty() as Players;
        }

        const playerIds = new Set(
            Generator.map((player) => player.id, players)
        );

        return this.filterByIds(playerIds);
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

    async *getNeighbors(): AsyncGenerator<[Player, Player]> {
        const reorderedPlayers: Array<Player> = [];

        for (const player of this) {
            // distance 1 neighbor
            await new PlayerNotSat(player).throwWhen(
                (error) => error.player.seatNumber === undefined
            );

            const seatNumber = player.seatNumber!;

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
