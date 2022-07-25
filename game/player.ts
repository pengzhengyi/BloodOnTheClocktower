import 'reflect-metadata';
import { Expose, Exclude, instanceToPlain } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { Character } from './character';
import { Nomination } from './nomination';
import {
    DeadPlayerCannotNominate,
    PlayerHasUnclearAlignment,
} from './exception';
import { Alignment } from './alignment';
import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import { DeadReason } from './deadreason';
import { CharacterAct } from './characteract';
import { GameUI } from '~/interaction/gameui';

enum NegativeState {
    None = 0,
    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    Dead = 1,

    /**
     * {@link `glossary["Drunk"]`}
     * A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    Drunk = 1 << 1,

    /**
     * {@link `glossary["Poisoned"]`}
     * A poisoned player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Poisoned players do not know they are poisoned. See Drunk.
     */
    Poisoned = 1 << 2,

    /**
     * {@link `glossary["Mad"]`}
     * A player who is “mad” about something is trying to convince the group that something is true. Some players are instructed to be mad about something - if the Storyteller thinks that a player has not put effort to convince the group of the thing they are mad about, then a penalty may apply. Some players are instructed to not be mad about something - if the Storyteller thinks that a player has tried to convince the group of that thing, then a penalty may apply.
     */
    Mad = 1 << 3,
}

/**
 * {@link `glossary["Player"]`}
 * Any person who has an in-play character, not including the Storyteller.
 */
@Exclude()
export class Player {
    static async init(
        username: string,
        character: typeof Character,
        alignment?: Alignment,
        id?: string
    ) {
        if (id === undefined) {
            id = uuid();
        }

        const player = new this(id, username, character);
        await player.initializeAlignment(alignment);
        return player;
    }

    @Expose({ toPlainOnly: true })
    declare alignment: Alignment;

    @Expose({ toPlainOnly: true })
    readonly id: string;

    @Expose({ toPlainOnly: true })
    username: string;

    declare character: typeof Character;

    characterAct?: CharacterAct;

    isWake = false;

    /**
     * {@link `glossary["Vote token"]`}
     * The round white circular token that is put on a player’s life token when they die. When this dead player votes, they remove their vote token and cannot vote for the rest of the game.
     */
    hasVoteToken = true;

    /**
     * {@link `glossary["State"]`}
     * A current property of a player. A player is always either drunk or sober, either poisoned or healthy, either alive or dead, and either mad or sane.
     */
    state: number = NegativeState.None;

    seatNumber?: number;

    readonly canSupportExile: boolean = true;

    deadReason?: DeadReason;

    /**
     * {@link `glossary["Healthy"]`}
     * Not poisoned.
     */
    get healthy(): boolean {
        return !this.poisoned;
    }

    get poisoned(): boolean {
        return (this.state & NegativeState.Poisoned) === NegativeState.Poisoned;
    }

    /**
     * {@link `glossary["Alive"]`}
     * A player that has not died. Alive players have their ability, may vote as many times as they wish, and may nominate players. As long as 3 or more players are alive, the game continues.
     */
    get alive(): boolean {
        return !this.dead;
    }

    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    get dead(): boolean {
        return (this.state & NegativeState.Dead) === NegativeState.Dead;
    }

    /**
     * {@link `glossary["Shroud"]`}
     * The black and grey banner-shaped token used in the Grimoire to indicate that a player is dead.
     */
    get hasShroud(): boolean {
        return this.dead;
    }

    /**
     * {@link `glossary["Sober"]`}
     * Not drunk.
     */
    get sober(): boolean {
        return !this.drunk;
    }

    /**
     * {@link `glossary["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    get drunk(): boolean {
        return (this.state & NegativeState.Drunk) === NegativeState.Drunk;
    }

    get sane(): boolean {
        return !this.mad;
    }

    get mad(): boolean {
        return (this.state & NegativeState.Mad) === NegativeState.Mad;
    }

    get canNominate(): boolean {
        return this.alive;
    }

    get canVote(): boolean {
        return this.alive || this.hasVoteToken;
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

    get isTraveller(): boolean {
        return Object.is(this.characterType, Traveller);
    }

    /**
     * {@link `glossary["Demon, The"]`}
     * The player that has the Demon character. In a game with multiple Demons, each alive Demon player counts as “The Demon”.
     */
    get isTheDemon(): boolean {
        return this.alive && Object.is(this.characterType, Demon);
    }

    get isAliveNontraveller(): boolean {
        return this.alive && !this.isTraveller;
    }

    get characterType(): typeof CharacterType {
        return this.character.characterType;
    }

    get isGood(): boolean {
        return this.alignment === Alignment.Good;
    }

    get isEvil(): boolean {
        return this.alignment === Alignment.Evil;
    }

    @Expose({ name: 'character', toPlainOnly: true })
    protected characterId(): string {
        return this.character.id;
    }

    protected constructor(
        id: string,
        username: string,
        character: typeof Character
    ) {
        this.id = id;
        this.username = username;
        this.initializeCharacter(character);
    }

    isCharacterType(characterType: typeof CharacterType): boolean {
        return Object.is(this.characterType, characterType);
    }

    async setDead(reason: DeadReason = DeadReason.Other): Promise<void> {
        this.deadReason = reason;
        this.state += NegativeState.Dead;
        await undefined;
    }

    async attack(victim: Player) {
        // TODO
        await victim.setDead(DeadReason.DemonAttack);
    }

    isAlly(other: Player) {
        return this.alignment === other.alignment;
    }

    *getAllies(players: Iterable<Player>): IterableIterator<Player> {
        for (const other of players) {
            if (!Object.is(this, other) && this.isAlly(other)) {
                yield other;
            }
        }
    }

    /**
     * {@link `glossary["Team"]`}
     * All players sharing an alignment. “Your team” means “You and all other players that have the same alignment as you.”
     *
     * @param players Players to find teammates in.
     */
    *getTeam(players: Iterable<Player>): IterableIterator<Player> {
        yield this;
        yield* this.getAllies(players);
    }

    toJSON() {
        return instanceToPlain(this);
    }

    valueOf() {
        return this.id;
    }

    equals(player: Player): boolean {
        return this.id === player.id;
    }

    async nominate(nominated: Player): Promise<Nomination | undefined> {
        if (!this.canNominate) {
            const error = new DeadPlayerCannotNominate(this);
            await error.resolve();
            if (!error.forceAllowNomination) {
                return;
            }
        }

        return await Nomination.init(this, nominated);
    }

    async collectVote(forExile: boolean): Promise<boolean> {
        const shouldCheckHandRaised =
            (forExile && this.canSupportExile) || this.canVote;
        if (
            shouldCheckHandRaised &&
            (await GameUI.hasRaisedHandForVote(this))
        ) {
            if (this.dead) {
                this.hasVoteToken = false;
            }

            return true;
        }

        return false;
    }

    protected initializeCharacter(character: typeof Character) {
        this.character = character;
        this.characterAct = CharacterAct.of(this);
    }

    protected async initializeAlignment(alignment?: Alignment) {
        if (alignment === undefined) {
            const alignment = this.characterType.defaultAlignment;

            if (alignment === undefined) {
                await new PlayerHasUnclearAlignment(this, alignment).throwWhen(
                    (error) => error.player.alignment === undefined
                );
            } else {
                this.alignment = alignment;
            }
        } else {
            this.alignment = alignment;
        }
    }
}

export type MinionPlayer = Player & {
    characterType: Minion;
};
export type DemonPlayer = Player & {
    characterType: Demon;
};
