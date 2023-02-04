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
import type { InteractionInitiator } from './effect/effect';
import { IncorrectNumberOfCharactersToAssign } from './exception';
import type { CharacterAssignmentResult, IPlayer } from './player';

/**
 * A collection of players. This collection supports operations on multiple players at once.
 */
export interface IPlayers extends Generator<IPlayer> {
    readonly length: number;

    /**
     * {@link `glossary["In play"]`}
     * A character that exists in the current game, either alive or dead.
     */
    readonly charactersInPlay: Iterable<Promise<CharacterToken>>;

    readonly isGood: Promise<Iterable<IPlayer>>;
    readonly isEvil: Promise<Iterable<IPlayer>>;
    readonly isMinion: Promise<Iterable<IPlayer>>;
    readonly isDemon: Promise<Iterable<IPlayer>>;
    readonly isTownsfolk: Promise<Iterable<IPlayer>>;
    readonly isOutsider: Promise<Iterable<IPlayer>>;
    readonly isFabled: Promise<Iterable<IPlayer>>;
    readonly alive: Promise<Iterable<IPlayer>>;

    /**
     * Another collection of same underlying players.
     *
     * The benefit of `clone` is to ensure the lazy operations on the cloned collection will not interfere the existing operations on original collection.
     *
     * ! It is a good habit to do operations on a clone to ensure unintended interference.
     *
     * For example, suppose we have a collection of players (Alice, Bob, ...), and we add a filter operation like selecting all players with female names (Alice ...) so that we can provide female avatar suggestions.
     *
     * Now if we do a `clone` of this collection, the new collection will no longer have this filter operation in place so that if we add a filter operation to select male names, we will correctly get players with male names (Bob...).
     *
     * Suppose this select male name operation is applied to the original collection instead of the cloned collection, then the result set will be empty because there cannot exist a name that is both female and male.
     *
     * @returns A new collection of same underlying players. The new collection will not inherit any existing operations.
     */
    clone(): IPlayers;

    findByCharacter(character: CharacterToken): Promise<IPlayer | undefined>;

    /**
     * Add a new player to the collection of players.
     *
     * This method is asynchronous because its implementation could require user confirmation.
     *
     * ! This method is different from @see `this.push` as `addPlayer` operate on the underlying players and will impact any following operations. More subtly, collection copies created by `clone` will also be impacted by the change since they share the same underlying set of players.
     *
     * @param newPlayer A new player to add.
     * @returns the current collection.
     */
    addPlayer(newPlayer: IPlayer): Promise<this>;
    /**
     * Remove a player from the collection of players.
     *
     * This method is asynchronous because its implementation could require user confirmation.
     *
     * ! This method operate on the underlying players and will impact any following operations. More subtly, collection copies created by `clone` will also be impacted by the change since they share the same underlying set of players.
     *
     * @param player A player to remove.
     * @returns the current collection.
     */
    deletePlayer(player: IPlayer): Promise<this>;
    /**
     * Whether the underlying players contain a given player.
     *
     * ! this method will operate on the underlying players and ignore any existing operations. For an alternative respecting existing operations, @see `this.any`
     *
     * @param player A player to find.
     * @returns whether the underlying players contain a given player.
     */
    hasPlayer(player: IPlayer): boolean;

    /**
     * Equivalent of invoking `from` on every player.
     */
    from(initiator?: InteractionInitiator): this;
    filterById(playerId: string): this;
    filterByIds(playerIds: Set<string>): this;
    intersect(players?: Iterable<IPlayer>): this;

    isCharacterType(
        characterType: typeof CharacterType
    ): Promise<Iterable<IPlayer>>;

    assignCharacters(
        characters: Array<CharacterToken>,
        travellerToAlignment?: Map<TravellerCharacterToken, Alignment>
    ): Promise<Array<CharacterAssignmentResult>>;
}

export class Players extends Generator<IPlayer> implements IPlayers {
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
        return this.filterAllAsync((player) => player.alive);
    }

    constructor(players: Array<IPlayer>) {
        super(players, [], false);
        this.players = players;
    }

    clone() {
        return new Players(this.players);
    }

    findByCharacter(character: CharacterToken): Promise<IPlayer | undefined> {
        return this.findAsync(
            async (player) => (await player.character) === character
        );
    }

    addPlayer(newPlayer: IPlayer) {
        this.players.push(newPlayer);
        return Promise.resolve(this);
    }

    deletePlayer(player: IPlayer) {
        const playerIndex = this.players.findIndex((playerToMatch) =>
            playerToMatch.equals(player)
        );

        if (playerIndex !== -1) {
            this.players.splice(playerIndex, 1);
        }

        return Promise.resolve(this);
    }

    hasPlayer(player: IPlayer): boolean {
        return this.players.some((playerToMatch) =>
            playerToMatch.equals(player)
        );
    }

    from(initiator?: InteractionInitiator): this {
        this.map((player) => player.from(initiator));
        return this;
    }

    filterById(playerId: string) {
        return this.filter((player) => player.id === playerId);
    }

    filterByIds(playerIds: Set<string>) {
        return this.filter((player) => playerIds.has(player.id));
    }

    intersect(players?: Iterable<IPlayer>) {
        const playerIds: Set<string> =
            players === undefined
                ? new Set()
                : new Set(Generator.map((player) => player.id, players));

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
