/* eslint-disable no-use-before-define */
import '@abraham/reflection';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { Alignment } from './alignment';
import type { CharacterToken } from './character';
import { DeadReason } from './dead-reason';
import { Death } from './death';
import { EffectTarget, IEffectTarget } from './effect/effect-target';
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
import { Generator } from './collections';
import { Environment } from '~/interaction/environment';

export interface CharacterAssignmentResult {
    player: IPlayer;

    character: CharacterToken;

    result: boolean;
}

export interface IPlayer extends IEffectTarget<IPlayer> {
    /* basic info */
    readonly id: string;
    readonly username: string;

    seatNumber: number | undefined;
    readonly alignment: Promise<Alignment>;
    readonly character: Promise<CharacterToken>;

    /* player state */
    /**
     * {@link `glossary["Healthy"]`}
     * Not poisoned.
     */
    readonly healthy: Promise<boolean>;
    /**
     * {@link `glossary["Poisoned"]`}
     *  A poisoned player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Poisoned players do not know they are poisoned. See Drunk.
     */
    readonly poisoned: Promise<boolean>;
    /**
     * {@link `glossary["Alive"]`}
     * A player that has not died. Alive players have their ability, may vote as many times as they wish, and may nominate players. As long as 3 or more players are alive, the game continues.
     */
    readonly alive: Promise<boolean>;
    /**
     * {@link `glossary["Dead"]`}
     * A player that is not alive. Dead players may only vote once more during the game. When a player dies, their life token flips over, they gain a shroud in the Grimoire, they immediately lose their ability, and any persistent effects of their ability immediately end.
     */
    readonly dead: Promise<boolean>;
    /**
     * {@link `glossary["Sober"]`}
     * Not drunk.
     */
    readonly sober: Promise<boolean>;
    /**
     * {@link `glossary["Drunk"]`}
     *  A drunk player has no ability but thinks they do, and the Storyteller acts like they do. If their ability would give them information, the Storyteller may give them false information. Drunk players do not know they are drunk.
     */
    readonly drunk: Promise<boolean>;
    readonly sane: Promise<boolean>;
    readonly mad: Promise<boolean>;

    readonly canNominate: Promise<boolean>;
    readonly canVote: Promise<boolean>;
    readonly canExile: Promise<boolean>;
    readonly hasAbility: Promise<boolean>;
    readonly willGetTrueInformation: Promise<boolean>;
    readonly willGetFalseInformation: Promise<boolean>;

    /* character type */
    readonly isMinion: Promise<boolean>;
    readonly isDemon: Promise<boolean>;
    readonly isTownsfolk: Promise<boolean>;
    readonly isOutsider: Promise<boolean>;
    readonly isFabled: Promise<boolean>;
    readonly isTraveller: Promise<boolean>;
    /**
     * {@link `glossary["Demon, The"]`}
     * The player that has the Demon character. In a game with multiple Demons, each alive Demon player counts as “The Demon”.
     */
    readonly isTheDemon: Promise<boolean>;
    readonly isAliveNontraveller: Promise<boolean>;
    readonly characterType: Promise<typeof CharacterType>;

    readonly isGood: Promise<boolean>;
    readonly isEvil: Promise<boolean>;

    assignCharacter(
        character: CharacterToken,
        alignment?: Alignment
    ): Promise<CharacterAssignmentResult>;
    setDead(reason?: DeadReason): Promise<Death>;
    setDrunk(reason?: DrunkReason): Promise<boolean>;
    attack(victim: IPlayer): Promise<Death>;
    nominate(
        nominated: IPlayer,
        execution: Execution
    ): Promise<Nomination | undefined>;
    collectVote(forExile: boolean): Promise<boolean>;
    revokeVoteToken(reason?: string): Promise<boolean>;

    storytellerGet(key: '_isDemon'): boolean;
    storytellerGet(key: '_character'): CharacterToken;
    storytellerGet(key: '_alive'): boolean;
    storytellerGet(key: '_dead'): boolean;
    storytellerGet(key: '_healthy'): boolean;
    storytellerGet(key: '_poisoned'): boolean;
    storytellerGet(key: '_sober'): boolean;
    storytellerGet(key: '_drunk'): boolean;
    storytellerGet(key: '_hasAbility'): boolean;
    storytellerGet(key: '_willGetTrueInformation'): boolean;
    storytellerGet(key: '_willGetFalseInformation'): boolean;

    storytellerGet<
        V,
        K extends keyof IPlayer | string = keyof IPlayer | string
    >(
        key: K
    ): V;

    toJSON(): Record<string, any>;
    valueOf(): string;
    equals(player: IPlayer): boolean;
    toString(): string;
}

/**
 * {@link `glossary["Player"]`}
 * Any person who has an in-play character, not including the Storyteller.
 */
@Exclude()
export class Player extends EffectTarget<IPlayer> implements IPlayer {
    protected static reasonForReclaimDeadPlayerVote =
        'Dead players may only vote once more during the game.';

    protected static revokeVoteTokenDefaultPrompt =
        'Revoke vote token for player: ';

    protected static defaultEnabledProxyHandlerPropertyNames: Array<
        keyof ProxyHandler<IPlayer>
    > = ['get'];

    static async init(
        username: string,
        character?: CharacterToken,
        alignment?: Alignment,
        _id?: string,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<IPlayer>>
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

    protected static async isCharacterType(
        player: IPlayer,
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

    @Expose({ toPlainOnly: true })
    readonly id;

    @Expose({ toPlainOnly: true })
    readonly username;

    seatNumber: number | undefined;

    get alignment() {
        return Promise.resolve(this._alignment);
    }

    @Expose({ name: 'alignment', toPlainOnly: true })
    protected declare _alignment: Alignment;

    get character() {
        return Promise.resolve(this._character);
    }

    @Expose({ name: 'character', toPlainOnly: true })
    protected _characterId(): string {
        return this._character.id;
    }

    protected declare _character: CharacterToken;

    /**
     * {@link `glossary["Vote token"]`}
     * The round white circular token that is put on a player’s life token when they die. When this dead player votes, they remove their vote token and cannot vote for the rest of the game.
     */
    protected hasVoteToken = true;

    get healthy() {
        return Promise.resolve(this._healthy);
    }

    protected get _healthy() {
        return this.state.healthy;
    }

    get poisoned() {
        return Promise.resolve(this._poisoned);
    }

    protected get _poisoned() {
        return this.state.poisoned;
    }

    get alive() {
        return Promise.resolve(this._alive);
    }

    protected get _alive() {
        return this.state.alive;
    }

    get dead() {
        return Promise.resolve(this._dead);
    }

    protected get _dead() {
        return Promise.resolve(this.state.dead);
    }

    get sober() {
        return Promise.resolve(this._sober);
    }

    protected get _sober() {
        return this.state.sober;
    }

    get drunk() {
        return Promise.resolve(this._drunk);
    }

    protected get _drunk() {
        return this.state.drunk;
    }

    get sane() {
        return Promise.resolve(this.state.sane);
    }

    get mad() {
        return Promise.resolve(this.state.mad);
    }

    get canNominate() {
        return this.alive;
    }

    get canVote(): Promise<boolean> {
        return this.alive.then((isAlive) => isAlive || this.hasVoteToken);
    }

    get canExile(): Promise<boolean> {
        return Promise.resolve(true);
    }

    get hasAbility(): Promise<boolean> {
        return Generator.everyAsync(
            (state) => state,
            Generator.promiseRaceAll([this.alive, this.sober, this.healthy])
        );
    }

    protected get _hasAbility(): boolean {
        return this._alive && this._sober && this._healthy;
    }

    get willGetTrueInformation(): Promise<boolean> {
        return Generator.everyAsync(
            (state) => state,
            Generator.promiseRaceAll([this.sober, this.healthy])
        );
    }

    protected get _willGetTrueInformation(): boolean {
        return Generator.every((state) => state, [this._sober, this._healthy]);
    }

    get willGetFalseInformation(): Promise<boolean> {
        return Generator.anyAsync(
            (state) => state,
            Generator.promiseRaceAll([this.drunk, this.poisoned])
        );
    }

    protected get _willGetFalseInformation(): boolean {
        return Generator.any((state) => state, [this._drunk, this._poisoned]);
    }

    get isMinion(): Promise<boolean> {
        return Player.isCharacterType(this, Minion);
    }

    get isDemon(): Promise<boolean> {
        return Player.isCharacterType(this, Demon);
    }

    get isTownsfolk(): Promise<boolean> {
        return Player.isCharacterType(this, Townsfolk);
    }

    get isOutsider(): Promise<boolean> {
        return Player.isCharacterType(this, Outsider);
    }

    get isFabled(): Promise<boolean> {
        return Player.isCharacterType(this, Fabled);
    }

    get isTraveller(): Promise<boolean> {
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

    get isTheDemon(): Promise<boolean> {
        return Generator.everyAsync(
            (condition) => condition,
            Generator.promiseRaceAll([this.alive, this.isDemon])
        );
    }

    get isAliveNontraveller() {
        const isNontraveller = this.isTraveller.then(
            (isTraveller) => !isTraveller
        );
        return Generator.everyAsync(
            (condition) => condition,
            Generator.promiseRaceAll([this.alive, isNontraveller])
        );
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

    protected constructor(
        id: string,
        username: string,
        character?: CharacterToken,
        alignment?: Alignment,
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<IPlayer>>
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

    setDead(reason: DeadReason = DeadReason.Other): Promise<Death> {
        this.state.dead = true;
        // TODO lose ability and influences
        return Promise.resolve(new Death(this, reason));
    }

    setDrunk(_reason: DrunkReason = DrunkReason.Other): Promise<boolean> {
        this.state.drunk = true;
        return this.drunk;
    }

    async attack(victim: IPlayer): Promise<Death> {
        // TODO
        return await victim.setDead(DeadReason.DemonAttack);
    }

    async nominate(
        nominated: IPlayer,
        execution: Execution
    ): Promise<Nomination | undefined> {
        if (!(await this.canNominate)) {
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
            (forExile && (await this.canExile)) || (await this.canVote);
        if (
            shouldCheckHandRaised &&
            (await Environment.current.gameUI.hasRaisedHandForVote(this))
        ) {
            if (await this.dead) {
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

    storytellerGet<
        V,
        K extends keyof IPlayer | string = keyof IPlayer | string
    >(key: K): V {
        return (this as Record<K, any>)[key] as V;
    }

    toJSON() {
        return instanceToPlain(this);
    }

    valueOf() {
        return this.id;
    }

    equals(player: IPlayer): boolean {
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
