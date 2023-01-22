import type { Alignment } from './alignment';
import type { CharacterToken, TravellerCharacterToken } from './character';
import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
} from './character-type';
import { Generator } from './collections';
import type { InteractionInitiator } from './effect';
import { IncorrectNumberOfCharactersToAssign } from './exception';
import type { CharacterAssignmentResult, IPlayer } from './player';

export type PlayersModification = (players: Array<IPlayer>) => void;

export class Players extends Generator<IPlayer> {
    static of(...players: Array<IPlayer>) {
        return new this(players);
    }

    static async allGood(players: Iterable<IPlayer>): Promise<boolean> {
        const areAlignmentsGood = await Promise.all(
            Generator.map((player) => player.isGood, players)
        );

        return areAlignmentsGood.every((isGood) => isGood);
    }

    static async allEvil(players: Iterable<IPlayer>): Promise<boolean> {
        const isPlayerEvil = Generator.promiseRaceAll(
            Generator.toPromise((player) => player.isEvil, players)
        );
        return await Generator.everyAsync((isEvil) => isEvil, isPlayerEvil);
    }

    protected readonly players: Array<IPlayer>;

    get length(): number {
        return this.players.length;
    }

    /**
     * {@link `glossary["In play"]`}
     * A character that exists in the current game, either alive or dead.
     */
    get charactersInPlay(): Iterable<Promise<CharacterToken>> {
        return Generator.toPromise((player) => player.character, this.players);
    }

    get isGood() {
        return this.filterAllAsync((player) => player.isGood);
    }

    get isEvil() {
        return this.filterAllAsync((player) => player.isEvil);
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

    get alive() {
        return this.filter((player) => player.alive);
    }

    constructor(players: Array<IPlayer>) {
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

    findByCharacter(character: CharacterToken): Promise<IPlayer | undefined> {
        return this.findAsync(
            async (player) => (await player.character) === character
        );
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

    intersect(players?: Iterable<IPlayer>) {
        if (players === undefined) {
            return Players.empty() as Players;
        }

        const playerIds = new Set(
            Generator.map((player) => player.id, players)
        );

        return this.filterByIds(playerIds);
    }

    isCharacterType(characterType: typeof CharacterType) {
        return this.filterAllAsync(async (player) =>
            (await player.character).is(characterType)
        );
    }

    async assignCharacters(
        characters: Array<CharacterToken>,
        travellerToAlignment?: Map<TravellerCharacterToken, Alignment>
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
                ([player, character]) =>
                    player.assignCharacter(
                        character,
                        travellerToAlignment?.get(character)
                    ),
                Generator.pair(this, characters)
            )
        );
    }
}
