import type { Alignment } from './alignment';
import type { CharacterToken } from './character';
import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
} from './charactertype';
import { Generator } from './collections';
import type { InteractionInitiator } from './effect';
import { IncorrectNumberOfCharactersToAssign } from './exception';
import type { CharacterAssignmentResult, Player } from './player';

export type PlayersModification = (players: Array<Player>) => void;

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

    get length(): number {
        return this.players.length;
    }

    /**
     * {@link `glossary["In play"]`}
     * A character that exists in the current game, either alive or dead.
     */
    get charactersInPlay(): Iterable<CharacterToken> {
        return Generator.map((player) => player.character, this.players);
    }

    get isMinion() {
        return this.isCharacterType(Minion);
    }

    get isDemon() {
        return this.isCharacterType(Demon);
    }

    get isTownsfolk() {
        return this.isCharacterType(Townsfolk);
    }

    get isOutsider() {
        return this.isCharacterType(Outsider);
    }

    get isFabled() {
        return this.isCharacterType(Fabled);
    }

    constructor(players: Array<Player>) {
        super(players, [], false);
        this.players = players;
    }

    clone(): Players {
        return new Players(this.players);
    }

    from(initiator?: InteractionInitiator): this {
        this.map((player) => player.from(initiator));
        return this;
    }

    modify(modification: PlayersModification) {
        modification(this.players);
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

    isCharacterType(characterType: typeof CharacterType) {
        return this.filter((player) => player.character.is(characterType));
    }

    async assignCharacters(
        characters: Array<CharacterToken>
    ): Promise<Array<CharacterAssignmentResult>> {
        if (characters.length !== this.length) {
            const error = new IncorrectNumberOfCharactersToAssign(
                this,
                characters
            );
            await error.throwWhen(
                (error) => error.characters.length !== error.players.length
            );
        }

        return await Promise.all(
            Generator.map(
                ([player, character]) => player.assignCharacter(character),
                Generator.pair(this, characters)
            )
        );
    }
}
