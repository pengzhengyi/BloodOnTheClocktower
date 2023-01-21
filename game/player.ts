/* eslint-disable no-use-before-define */
import '@abraham/reflection';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { Alignment } from './alignment';
import type { CharacterToken } from './character';
import { DeadReason } from './dead-reason';
import { Death } from './death';
import { EffectTarget } from './effect-target';
import { Nomination } from './nomination';
import { PlayerState } from './player-state';

import {
    CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character-type';
import {
    DeadPlayerCannotNominate,
    PlayerHasUnclearAlignment,
    ReassignCharacterToPlayer,
} from './exception';
import type { Execution } from './execution';
import { DrunkReason } from './drunk-reason';
import { Environment } from '~/interaction/environment';

export interface CharacterAssignmentResult {
    player: Player;

    character: CharacterToken;

    result: boolean;
}

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
        character?: CharacterToken,
        alignment?: Alignment,
        _id?: string,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Player>>
    ) {
        const id = _id ?? uuid();

        if (enabledProxyHandlerPropertyNames === undefined) {
            enabledProxyHandlerPropertyNames =
                this.defaultEnabledProxyHandlerPropertyNames;
        }

        const player = await PlayerHasUnclearAlignment.catch<
            PlayerHasUnclearAlignment,
            Player
        >(
            () =>
                Promise.resolve(
                    new this(
                        id,
                        username,
                        character,
                        alignment,
                        enabledProxyHandlerPropertyNames
                    )
                ),
            (error) =>
                Promise.resolve(
                    new this(
                        id,
                        username,
                        character,
                        error.correctedAlignment,
                        enabledProxyHandlerPropertyNames
                    )
                )
        );

        return player.getProxy();
    }

    static async isCharacterType(
        player: Player,
        characterType: typeof CharacterType
    ): Promise<boolean> {
        return (await player.characterType).is(characterType);
    }

    protected static _isCharacterType(
        player: Player,
        characterType: typeof CharacterType
    ): boolean {
        return player._characterType.is(characterType);
    }

    get alignment(): Promise<Alignment> {
        return Promise.resolve(this._alignment);
    }

    @Expose({ name: 'alignment', toPlainOnly: true })
    protected declare _alignment: Alignment;

    @Expose({ toPlainOnly: true })
    readonly id: string;

    @Expose({ toPlainOnly: true })
    username: string;

    get character(): Promise<CharacterToken> {
        return Promise.resolve(this._character);
    }

    protected declare _character: CharacterToken;

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
        return this.state.poisoned;
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

    get canVote(): Promise<boolean> {
        return Promise.resolve(this.alive || this.hasVoteToken);
    }

    get hasAbility(): boolean {
        return !this.dead && !this.drunk && !this.poisoned;
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

    get isTraveller() {
        return Player.isCharacterType(this, Traveller);
    }

    protected get _isMinion() {
        return Player._isCharacterType(this, Minion);
    }

    protected get _isDemon() {
        return Player._isCharacterType(this, Demon);
    }

    protected get _isTownsfolk() {
        return Player._isCharacterType(this, Townsfolk);
    }

    protected get _isOutsider() {
        return Player._isCharacterType(this, Outsider);
    }

    protected get _isFabled() {
        return Player._isCharacterType(this, Fabled);
    }

    protected get _isTraveller() {
        return Player._isCharacterType(this, Traveller);
    }

    /**
     * {@link `glossary["Demon, The"]`}
     * The player that has the Demon character. In a game with multiple Demons, each alive Demon player counts as “The Demon”.
     */
    get isTheDemon(): Promise<boolean> {
        return this.isDemon.then((isDemon) => this.alive && isDemon);
    }

    get isAliveNontraveller() {
        if (!this.alive) {
            return Promise.resolve(false);
        }

        return this.isTraveller.then((isTraveller) => !isTraveller);
    }

    get characterType(): Promise<typeof CharacterType> {
        return this.character.then((character) => character.characterType);
    }

    get isGood(): Promise<boolean> {
        return this.alignment.then((alignment) => alignment === Alignment.Good);
    }

    get isEvil(): Promise<boolean> {
        return this.alignment.then((alignment) => alignment === Alignment.Evil);
    }

    protected get _characterType(): typeof CharacterType {
        return this._character.characterType;
    }

    /**
     * {@link `glossary["State"]`}
     * A current property of a player. A player is always either drunk or sober, either poisoned or healthy, either alive or dead, and either mad or sane.
     */
    protected readonly state: PlayerState = PlayerState.init();

    @Expose({ name: 'character', toPlainOnly: true })
    protected _characterId(): string {
        return this._character.id;
    }

    protected constructor(
        id: string,
        username: string,
        character?: CharacterToken,
        alignment?: Alignment,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Player>>
    ) {
        super(enabledProxyHandlerPropertyNames);
        this.id = id;
        this.username = username;

        if (alignment !== undefined) {
            this._alignment = alignment;
        }

        if (character !== undefined) {
            this.initializeCharacter(character);
        }
    }

    async assignCharacter(
        character: CharacterToken,
        alignment?: Alignment
    ): Promise<CharacterAssignmentResult> {
        if (this._character !== undefined) {
            const error = new ReassignCharacterToPlayer(
                this,
                this._character,
                character
            );
            await error.resolve();

            if (!error.shouldReassign) {
                return {
                    player: this,
                    character,
                    result: false,
                };
            }
        }

        if (alignment !== undefined) {
            this._alignment = alignment;
        }

        this.initializeCharacter(character);

        return {
            player: this,
            character,
            result: true,
        };
    }

    async setDead(reason: DeadReason = DeadReason.Other): Promise<Death> {
        this.deadReason = reason;
        this.state.dead = true;
        // TODO lose ability and influences
        await undefined;
        return new Death(this, reason);
    }

    setDrunk(_reason: DrunkReason = DrunkReason.Other): Promise<boolean> {
        this.state.drunk = true;
        return Promise.resolve(this.drunk);
    }

    async attack(victim: Player): Promise<Death> {
        // TODO
        return await victim.setDead(DeadReason.DemonAttack);
    }

    async nominate(
        nominated: Player,
        execution: Execution
    ): Promise<Nomination | undefined> {
        if (!this.canNominate) {
            const error = new DeadPlayerCannotNominate(this);
            await error.resolve();
            if (!error.forceAllowNomination) {
                return;
            }
        }

        const nomination = await Nomination.init(this, nominated);
        if (await execution.addNomination(nomination)) {
            return nomination;
        }
    }

    async collectVote(forExile: boolean): Promise<boolean> {
        const shouldCheckHandRaised =
            (forExile && this.canSupportExile) || (await this.canVote);
        if (
            shouldCheckHandRaised &&
            (await Environment.current.gameUI.hasRaisedHandForVote(this))
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
            await Environment.current.gameUI.storytellerConfirm(
                this.formatPromptForRevokeVoteToken(reason)
            )
        ) {
            this.hasVoteToken = false;
            return true;
        } else {
            return false;
        }
    }

    storytellerGet<V, K extends keyof Player | string = keyof Player | string>(
        key: K
    ): V {
        return (this as Record<K, any>)[key] as V;
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
        this._character = character;

        if (this._alignment === undefined) {
            const alignment = this._characterType.defaultAlignment;
            if (alignment === undefined) {
                throw new PlayerHasUnclearAlignment(this, alignment);
            } else {
                this._alignment = alignment;
            }
        }
    }

    protected initializeEffects() {
        super.initializeEffects();
        // TODO initialize player specific effects
    }
}
