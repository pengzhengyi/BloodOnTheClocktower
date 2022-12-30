/* eslint-disable no-use-before-define */
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import 'reflect-metadata';
import { v4 as uuid } from 'uuid';
import { Alignment } from './alignment';
import type { CharacterToken } from './character';
import { CharacterAct } from './characteract';
import { DeadReason } from './deadreason';
import { Death } from './death';
import { EffectTarget } from './effecttarget';
import { InfoRequester } from './info';
import { Nomination } from './nomination';
import { PlayerState } from './playerstate';

import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './charactertype';
import {
    DeadPlayerCannotNominate,
    PlayerHasUnclearAlignment,
} from './exception';

import { GAME_UI } from '~/interaction/gameui';

/**
 * {@link `glossary["Player"]`}
 * Any person who has an in-play character, not including the Storyteller.
 */
@Exclude()
export class Player extends EffectTarget<Player> {
    static reasonForReclaimDeadPlayerVote =
        'Dead players may only vote once more during the game.';

    static revokeVoteTokenDefaultPrompt = 'Revoke vote token for player: ';

    protected static defaultEnabledProxyHandlerPropertyNames: Array<
        keyof ProxyHandler<Player>
    > = ['get'];

    static async init(
        username: string,
        character: CharacterToken,
        alignment?: Alignment,
        id?: string,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Player>>
    ) {
        if (id === undefined) {
            id = uuid();
        }

        if (enabledProxyHandlerPropertyNames === undefined) {
            enabledProxyHandlerPropertyNames =
                this.defaultEnabledProxyHandlerPropertyNames;
        }

        const player = new this(
            id,
            username,
            character,
            enabledProxyHandlerPropertyNames
        );
        await player.initializeAlignment(alignment);
        return player.getProxy();
    }

    static isAlly(player: Player, otherPlayer: Player) {
        return player.alignment === otherPlayer.alignment;
    }

    static *getAllies(
        player: Player,
        otherPlayers: Iterable<Player>
    ): IterableIterator<Player> {
        for (const other of otherPlayers) {
            if (!Object.is(player, other) && this.isAlly(player, other)) {
                yield other;
            }
        }
    }

    static isCharacterType(
        player: Player,
        characterType: typeof CharacterType
    ): boolean {
        return player.characterType.is(characterType);
    }

    @Expose({ toPlainOnly: true })
    declare alignment: Alignment;

    @Expose({ toPlainOnly: true })
    readonly id: string;

    @Expose({ toPlainOnly: true })
    username: string;

    declare character: CharacterToken;

    /**
     * TODO should this be an array?
     */
    characterActs?: CharacterAct;

    infoRequester?: unknown;

    isWake = false;

    /**
     * {@link `glossary["Vote token"]`}
     * The round white circular token that is put on a player’s life token when they die. When this dead player votes, they remove their vote token and cannot vote for the rest of the game.
     */
    hasVoteToken = true;

    seatNumber?: number;

    readonly canSupportExile: boolean = true;

    deadReason?: DeadReason;

    /**
     * {@link `glossary["Healthy"]`}
     * Not poisoned.
     */
    get healthy(): boolean {
        return this.state.healthy;
    }

    get poisoned(): boolean {
        return this.state.healthy;
    }

    /**
     * {@link `glossary["Alive"]`}
     * A player that has not died. Alive players have their ability, may vote as many times as they wish, and may nominate players. As long as 3 or more players are alive, the game continues.
     */
    get alive(): boolean {
        return this.state.alive;
    }

    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    get dead(): boolean {
        return this.state.dead;
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
        return this.state.sober;
    }

    /**
     * {@link `glossary["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    get drunk(): boolean {
        return this.state.drunk;
    }

    get sane(): boolean {
        return this.state.sane;
    }

    get mad(): boolean {
        return this.state.mad;
    }

    get canNominate(): boolean {
        return this.alive;
    }

    get canVote(): boolean {
        return this.alive || this.hasVoteToken;
    }

    get isMinion() {
        return Player.isCharacterType(this, Minion);
    }

    get isDemon() {
        return Player.isCharacterType(this, Demon);
    }

    get isTownsfolk() {
        return Player.isCharacterType(this, Townsfolk);
    }

    get isOutsider() {
        return Player.isCharacterType(this, Outsider);
    }

    get isFabled() {
        return Player.isCharacterType(this, Fabled);
    }

    get isTraveller(): boolean {
        return this.characterType.is(Traveller);
    }

    get willGetFalseInfo(): boolean {
        return this.drunk || this.poisoned;
    }

    /**
     * {@link `glossary["Demon, The"]`}
     * The player that has the Demon character. In a game with multiple Demons, each alive Demon player counts as “The Demon”.
     */
    get isTheDemon(): boolean {
        return this.alive && this.isDemon;
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

    /**
     * {@link `glossary["State"]`}
     * A current property of a player. A player is always either drunk or sober, either poisoned or healthy, either alive or dead, and either mad or sane.
     */
    protected readonly state: PlayerState = PlayerState.init();

    @Expose({ name: 'character', toPlainOnly: true })
    protected characterId(): string {
        return this.character.id;
    }

    protected constructor(
        id: string,
        username: string,
        character: CharacterToken,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Player>>
    ) {
        super(enabledProxyHandlerPropertyNames);
        this.id = id;
        this.username = username;
        this.initializeCharacter(character);
        this.initializeEffects();
    }

    async setDead(reason: DeadReason = DeadReason.Other): Promise<Death> {
        this.deadReason = reason;
        this.state.dead = true;
        // TODO lose ability and influences
        await undefined;
        return new Death(this, reason);
    }

    async attack(victim: Player): Promise<Death> {
        // TODO
        return await victim.setDead(DeadReason.DemonAttack);
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
            (await GAME_UI.hasRaisedHandForVote(this))
        ) {
            if (this.dead) {
                await this.revokeVoteToken(
                    Player.reasonForReclaimDeadPlayerVote
                );
            }

            return true;
        }

        return false;
    }

    async revokeVoteToken(reason?: string): Promise<boolean> {
        if (
            await GAME_UI.storytellerConfirm(
                this.formatPromptForRevokeVoteToken(reason)
            )
        ) {
            this.hasVoteToken = false;
            return true;
        } else {
            return false;
        }
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

    toString() {
        return `${this.username}(${this.id})`;
    }

    protected formatPromptForRevokeVoteToken(reason?: string): string {
        const hasReason = reason === undefined;
        const playerString = this.toString();
        return (
            (hasReason ? reason + ' ' : '') +
            Player.revokeVoteTokenDefaultPrompt +
            playerString
        );
    }

    protected initializeCharacter(character: CharacterToken) {
        this.character = character;
        this.characterActs = CharacterAct.fromPlayer(this)[0];
        this.infoRequester = InfoRequester.of(this);
    }

    protected initializeEffects() {
        super.initializeEffects();
        // TODO initialize player specific effects
    }

    protected async initializeAlignment(alignment?: Alignment) {
        if (alignment === undefined) {
            alignment = this.characterType.defaultAlignment;

            if (alignment === undefined) {
                await new PlayerHasUnclearAlignment(this, alignment).throwWhen(
                    (error) => error.player.alignment === undefined
                );
            }
        }

        this.alignment = alignment!;
    }
}

export type MinionPlayer = Player & {
    characterType: Minion;
};
export type DemonPlayer = Player & {
    characterType: Demon;
};
