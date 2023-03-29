/* eslint-disable no-use-before-define */
import '@abraham/reflection';
import { Exclude, Expose, instanceToPlain } from 'class-transformer';
import { v4 as uuid } from 'uuid';
import { Alignment } from './alignment';
import type { CharacterToken } from './character/character';
import { DeadReason } from './dead-reason';
import { Death } from './death';
import { EffectTarget, type IEffectTarget } from './effect/effect-target';
import type { INomination } from './nomination';
import { Nomination } from './nomination';
import { type IPlayerState, PlayerState, State } from './player-state';

import {
    type CharacterType,
    Demon,
    Fabled,
    Minion,
    Outsider,
    Townsfolk,
    Traveller,
} from './character/character-type';
import { DeadPlayerCannotNominate } from './exception/dead-player-cannot-nominate';
import { DrunkReason } from './drunk-reason';
import { Generator } from './collections';
import type { IPoisonedReason } from './poisoned-reason';
import { PlayerHasUnclearAlignment } from './exception/player-has-unclear-alignment';
import { ReassignCharacterToPlayer } from './exception/reassign-character-to-player';
import type { IAbilities } from './ability/abilities';
import { Abilities } from './ability/abilities';
import type { CharacterAssignmentResult, TJSON } from './types';
import { InteractionEnvironment } from '~/interaction/environment/environment';

export interface IPlayer extends IEffectTarget<IPlayer> {
    /* basic info */
    readonly id: string;
    readonly username: string;

    seatNumber: number | undefined;
    abilities: IAbilities;
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
        alignment?: Alignment,
        force?: boolean,
        reason?: string
    ): Promise<CharacterAssignmentResult>;
    setDead(reason?: DeadReason): Promise<Death>;
    setDrunk(reason?: DrunkReason): Promise<boolean>;
    setPoison(reason: IPoisonedReason): Promise<boolean>;
    removePoison(reason: IPoisonedReason): Promise<boolean>;
    nominate(nominated: IPlayer): Promise<INomination | undefined>;
    collectVote(forExile: boolean): Promise<boolean>;
    revokeVoteToken(reason?: string): Promise<boolean>;

    storytellerGet(key: '_isDemon'): boolean;
    storytellerGet(key: '_alignment'): Alignment;
    storytellerGet(key: '_character'): CharacterToken;
    storytellerGet(key: '_characterType'): typeof CharacterType;
    storytellerGet(key: '_alive'): boolean;
    storytellerGet(key: '_dead'): boolean;
    storytellerGet(key: '_healthy'): boolean;
    storytellerGet(key: '_poisoned'): boolean;
    storytellerGet(key: '_sober'): boolean;
    storytellerGet(key: '_drunk'): boolean;
    storytellerGet(key: '_state'): IPlayerState;
    storytellerGet(key: '_isTheDemon'): boolean;
    storytellerGet(key: '_hasAbility'): boolean;
    storytellerGet(key: '_willGetTrueInformation'): boolean;
    storytellerGet(key: '_willGetFalseInformation'): boolean;

    storytellerGet<
        V,
        K extends keyof IPlayer | string = keyof IPlayer | string
    >(
        key: K
    ): V;

    toJSON(): TJSON;
    valueOf(): string;
    equals(player: IPlayer): boolean;
    toString(): string;
}

type IPlayerBasicInfo = Pick<IPlayer, 'id' | 'username' | 'seatNumber'>;
export type IPlayerInfo = IPlayerBasicInfo & {
    state: IPlayerState;
    character: CharacterToken;
    alignment: Alignment;
};

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

    protected static assignCharacterDefaultPrompt =
        'Assign character and alignment for player: ';

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

    static format(playerInfo: IPlayerInfo) {
        const basicInfo = this.formatBasicInfo(playerInfo);
        const extendedInfo = `[${playerInfo.state} | ${playerInfo.alignment} ${playerInfo.character}]`;
        return basicInfo + extendedInfo;
    }

    static formatBasicInfo(playerBasicInfo: IPlayerBasicInfo) {
        const seatStr =
            playerBasicInfo.seatNumber === undefined
                ? 'no seat'
                : `seat ${playerBasicInfo.seatNumber}`;
        return `${playerBasicInfo.username}(${playerBasicInfo.id}, ${seatStr})`;
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

    abilities: IAbilities;

    get alignment() {
        return Promise.resolve(this._alignment);
    }

    @Expose({ name: 'alignment', toPlainOnly: true })
    protected declare _alignment: Alignment;

    get character() {
        return Promise.resolve(this._character);
    }

    protected declare _character: CharacterToken;

    @Expose({ name: 'character', toPlainOnly: true })
    protected _characterId(): string {
        return this._character.id;
    }

    /**
     * {@link `glossary["Vote token"]`}
     * The round white circular token that is put on a player’s life token when they die. When this dead player votes, they remove their vote token and cannot vote for the rest of the game.
     */
    protected hasVoteToken = true;

    get healthy() {
        return Promise.resolve(this._healthy);
    }

    protected get _healthy() {
        return this._state.healthy;
    }

    get poisoned() {
        return Promise.resolve(this._poisoned);
    }

    protected get _poisoned() {
        return this._state.poisoned;
    }

    get alive() {
        return Promise.resolve(this._alive);
    }

    protected get _alive() {
        return this._state.alive;
    }

    get dead() {
        return Promise.resolve(this._dead);
    }

    protected get _dead() {
        return this._state.dead;
    }

    get sober() {
        return Promise.resolve(this._sober);
    }

    protected get _sober() {
        return this._state.sober;
    }

    get drunk() {
        return Promise.resolve(this._drunk);
    }

    protected get _drunk() {
        return this._state.drunk;
    }

    get sane() {
        return Promise.resolve(this._state.sane);
    }

    get mad() {
        return Promise.resolve(this._state.mad);
    }

    get canNominate() {
        return Promise.resolve(this.alive);
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

    protected get _isTheDemon(): boolean {
        return this._alive && this._isDemon;
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

    protected get _characterType(): typeof CharacterType {
        return this._character.characterType;
    }

    get isGood(): Promise<boolean> {
        return this.alignment.then((alignment) => alignment === Alignment.Good);
    }

    get isEvil(): Promise<boolean> {
        return this.alignment.then((alignment) => alignment === Alignment.Evil);
    }

    /**
     * {@link `glossary["State"]`}
     * A current property of a player. A player is always either drunk or sober, either poisoned or healthy, either alive or dead, and either mad or sane.
     */
    protected readonly _state: PlayerState = new PlayerState();

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
        this.abilities = new Abilities();

        // alignment and character can be lazy initialized
        alignment = this.tryInferAlignment(alignment, character);
        if (alignment !== undefined) {
            this._alignment = alignment;
        }

        if (character !== undefined) {
            this._character = character;
        }
    }

    async assignCharacter(
        character: CharacterToken,
        alignment?: Alignment,
        force = false,
        reason?: string
    ): Promise<CharacterAssignmentResult> {
        if (!(await this.canAssignCharacter(character, force, reason))) {
            return {
                player: this,
                character,
                result: false,
            };
        }

        this._alignment = this.inferAlignment(alignment, character);
        this._character = character;

        return {
            player: this,
            character,
            result: true,
        };
    }

    setDead(reason: DeadReason = DeadReason.Other): Promise<Death> {
        this._state.setNegativeState(State.Dead, true, reason);
        // TODO lose ability and influences
        return Promise.resolve(new Death(this, reason));
    }

    setDrunk(reason: DrunkReason = DrunkReason.Other): Promise<boolean> {
        this._state.setNegativeState(State.Drunk, true, reason);
        return this.drunk;
    }

    setPoison(reason: IPoisonedReason): Promise<boolean> {
        this._state.setNegativeState(State.Poisoned, true, reason);
        return this.poisoned;
    }

    removePoison(reason: IPoisonedReason): Promise<boolean> {
        this._state.setNegativeState(State.Poisoned, false, reason);
        return this.healthy;
    }

    async nominate(nominated: IPlayer): Promise<INomination | undefined> {
        if (!(await this.canNominate)) {
            const error = new DeadPlayerCannotNominate(this);
            await error.resolve();
            if (!error.forceAllowNomination) {
                return;
            }
        }

        const nomination = new Nomination(this, nominated);
        return nomination;
    }

    async collectVote(forExile: boolean): Promise<boolean> {
        const shouldCheckHandRaised =
            (forExile && (await this.canExile)) || (await this.canVote);
        if (
            shouldCheckHandRaised &&
            (await InteractionEnvironment.current.gameUI.hasRaisedHandForVote(
                this
            ))
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
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
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
        return Player.formatBasicInfo({
            id: this.id,
            username: this.username,
            seatNumber: this.seatNumber,
        });
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

    protected formatPromptForAssignCharacter(reason?: string): string {
        const hasReason = reason === undefined;
        const playerString = this.toString();
        return (
            (hasReason ? reason + ' ' : '') +
            Player.assignCharacterDefaultPrompt +
            playerString
        );
    }

    protected inferAlignment(
        alignment?: Alignment,
        character?: CharacterToken
    ): Alignment {
        const inferredAlignment = this.tryInferAlignment(alignment, character);
        if (inferredAlignment === undefined) {
            throw new PlayerHasUnclearAlignment(this, inferredAlignment);
        } else {
            return inferredAlignment;
        }
    }

    protected tryInferAlignment(
        alignment?: Alignment,
        character?: CharacterToken
    ): Alignment | undefined {
        if (alignment !== undefined) {
            return alignment;
        }

        return character?.characterType.defaultAlignment;
    }

    protected initializeEffects() {
        super.initializeEffects();
        // TODO initialize player specific effects
    }

    protected validateCharacterNotAssigned(newCharacter: CharacterToken) {
        if (this._character !== undefined) {
            throw new ReassignCharacterToPlayer(
                this,
                this._character,
                newCharacter
            );
        }
    }

    protected async canAssignCharacter(
        character: CharacterToken,
        force: boolean,
        reason?: string
    ): Promise<boolean> {
        if (this._character === undefined) {
            return true;
        }

        let shouldReassign = true;
        if (force) {
            shouldReassign =
                await InteractionEnvironment.current.gameUI.storytellerConfirm(
                    this.formatPromptForAssignCharacter(reason)
                );
        } else {
            await ReassignCharacterToPlayer.catch(
                () =>
                    Promise.resolve(
                        this.validateCharacterNotAssigned(character)
                    ),
                async (error) => {
                    shouldReassign = await error.shouldReassign;
                }
            );
        }

        return shouldReassign;
    }
}
