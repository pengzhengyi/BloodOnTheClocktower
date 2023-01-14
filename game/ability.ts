/* eslint-disable @typescript-eslint/no-redeclare */
import {
    CharacterNightEffect,
    Effect,
    InteractionContext,
    RegisterAsCharacterEffect,
    RegisterAsGoodAlignmentEffect,
    SafeFromDemonEffect,
} from './effect';
import {
    AbilityRequiresSetup,
    ButlerNotChooseMasterToFollow,
    FortuneTellerChooseInvalidPlayers,
    MonkNotChoosePlayerToProtect,
    RavenkeeperNotChoosePlayerToProtect,
    RecoverableGameError,
    SlayerNotChoosePlayerToKill,
    UndertakerRequestInfoWhenNoExecution,
} from './exception';
import {
    ChefInformationRequester,
    EmpathInformationRequester,
    FortuneTellerInformationRequestContext,
    FortuneTellerInformationRequester,
    IInfoRequester,
    IInformationRequester,
    InfoRequestContext,
    InformationRequestContext,
    InvestigatorInformationRequester,
    LibrarianInformationRequester,
    RavenkeeperInformationRequestContext,
    RavenkeeperInformationRequester,
    UndertakerInformationRequestContext,
    UndertakerInformationRequester,
    WasherwomanInformationRequester,
} from './inforequester';
import { Alignment } from './alignment';
import type { CharacterToken } from './character';
import { CachingGenerator, Generator } from './collections';
import { DeadReason } from './deadreason';
import type { CharacterSheet } from './charactersheet';
import type { Death } from './death';
import type { Execution } from './execution';
import type { Game } from './game';
import { BasicGamePhaseKind, CompositeGamePhaseKind } from './gamephase';
import type { NightSheet } from './nightsheet';
import type { Nomination } from './nomination';
import type { NextFunction } from './middleware';
import type { Player } from './player';
import type { Players } from './players';
import type {
    ButlerPlayer,
    Constructor,
    FortuneTellerPlayer,
    MayorPlayer,
    MonkPlayer,
    RavenkeeperPlayer,
    ReclusePlayer,
    RequireExecution,
    RequireGame,
    SaintPlayer,
    SlayerPlayer,
    SoldierPlayer,
    StaticThis,
    VirginPlayer,
} from './types';
import type { InfoProvideContext } from './infoprovider';
import type {
    ChefInformation,
    EmpathInformation,
    FortuneTellerInformation,
    Info,
    InvestigatorInformation,
    LibrarianInformation,
    RavenkeeperInformation,
    UndertakerInformation,
    WasherwomanInformation,
} from './information';
import { GAME_UI } from '~/interaction/gameui';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { Monk } from '~/content/characters/output/monk';

export interface AbilityUseContext {
    requestedPlayer: Player;
    players: Players;
}

export interface AbilitySetupContext extends AbilityUseContext {
    nightSheet: NightSheet;
    characterSheet: CharacterSheet;
}

export enum AbilityUseStatus {
    Failure = 0 /* 0 */,

    ErrorHandled = 0b1 /* 1 */,

    Success = 0b10 /* 2 */,

    Malfunction = 0b100 /* 4 */,

    HasInfo = 0b1000 /* 8 */,

    Communicated = 0b10000 /* 16 */,

    HasEffect = 0b100000 /* 32 */,
}

export const AbilitySuccessUseWhenMalfunction =
    AbilityUseStatus.Success | AbilityUseStatus.Malfunction;

export const AbilitySuccessUseWhenHasEffect =
    AbilityUseStatus.Success | AbilityUseStatus.HasEffect;

export const AbilitySuccessCommunicatedInfo =
    AbilityUseStatus.Success |
    AbilityUseStatus.HasInfo |
    AbilityUseStatus.Communicated;

export interface AbilityUseResult {
    status: number;

    description?: string;

    error?: Error;
}

export interface IAbility<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext = AbilitySetupContext
> {
    hasSetup: boolean;

    isEligible(context: TAbilityUseContext): Promise<boolean>;

    willMalfunction(context: TAbilityUseContext): Promise<boolean>;

    setup(context: TAbilitySetupContext): Promise<void>;

    use(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    loseAbility(reason?: string): Promise<void>;

    createContext(...args: any[]): Promise<TAbilityUseContext>;
}

/**
 * {@link `glossary["Ability"]`}
 * The special power or penalty of a character, printed on its character token, the character sheet for the chosen edition, and the character almanac for the chosen edition. The definitive text of the ability is printed in the “How to Run” section of the character almanac. Characters have no ability when dead, drunk, or poisoned.
 */
abstract class Ability<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext = AbilitySetupContext
> implements IAbility<TAbilityUseContext, TAbilityUseResult>
{
    static readonly REASON_FOR_UNEXPECTED_ERROR =
        'Unexpected error encountered during ability use';

    static readonly REASON_FOR_HANDLED_ERROR =
        'Recoverable error encountered and handled during ability use';

    static async init<
        TAbilityUseContext extends AbilityUseContext,
        TAbilityUseResult extends AbilityUseResult,
        TAbilitySetupContext extends AbilitySetupContext,
        TAbility extends Ability<
            TAbilityUseContext,
            TAbilityUseResult,
            TAbilitySetupContext
        >
    >(
        this: StaticThis<TAbility>,
        context: TAbilitySetupContext
    ): Promise<TAbility> {
        const instance = new this();
        await instance.setup(context);
        return instance;
    }

    get hasSetup() {
        return this._hasSetup;
    }

    protected _hasSetup = false;

    abstract useWhenMalfunction(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    abstract useWhenNormal(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    abstract createContext(...args: any[]): Promise<TAbilityUseContext>;

    isEligible(context: TAbilityUseContext): Promise<boolean> {
        return Promise.resolve(context.requestedPlayer.alive);
    }

    setup(_context: TAbilitySetupContext): Promise<void> {
        this._hasSetup = true;
        return Promise.resolve(undefined);
    }

    loseAbility(_reason?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async use(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        try {
            return await RecoverableGameError.catch<
                RecoverableGameError,
                TAbilityUseResult | AbilityUseResult
            >(
                async () => {
                    if (await this.willMalfunction(context)) {
                        return await this.useWhenMalfunction(context);
                    } else {
                        return await this.useWhenNormal(context);
                    }
                },
                (error) =>
                    Promise.resolve({
                        status: error.handled
                            ? AbilityUseStatus.Failure |
                              AbilityUseStatus.ErrorHandled
                            : AbilityUseStatus.Failure,
                        reason: error.handled
                            ? Ability.REASON_FOR_HANDLED_ERROR
                            : Ability.REASON_FOR_UNEXPECTED_ERROR,
                        error,
                    })
            );
        } catch (error) {
            return {
                status: AbilityUseStatus.Failure,
                description: Ability.REASON_FOR_UNEXPECTED_ERROR,
                error: error as Error,
            };
        }
    }

    willMalfunction(context: TAbilityUseContext): Promise<boolean> {
        return Promise.resolve(!context.requestedPlayer.hasAbility);
    }

    toString(): string {
        return this.constructor.name;
    }
}

function RequireSetup<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext,
    TAbility extends Constructor<
        IAbility<TAbilityUseContext, TAbilityUseResult, TAbilitySetupContext>
    >
>(AbilityClass: TAbility) {
    return class requireSetup extends AbilityClass {
        async use(
            context: TAbilityUseContext
        ): Promise<TAbilityUseResult | AbilityUseResult> {
            if (!this.hasSetup) {
                const error = new AbilityRequiresSetup(this, context);
                await error.resolve();
            }

            return await super.use(context);
        }
    };
}

export interface GetInfoAbilityUseContext
    extends InfoProvideContext,
        AbilityUseContext {}

export interface GetInfoAbilityUseResult<TInformation>
    extends AbilityUseResult {
    info?: Info<TInformation>;
}

abstract class GetInfoAbility<
    TInformation,
    TInfoRequestContext extends InfoRequestContext<TInformation>,
    TInfoRequester extends IInfoRequester<TInformation, TInfoRequestContext>,
    TAbilityUseContext extends GetInfoAbilityUseContext,
    TAbilityUseResult extends GetInfoAbilityUseResult<TInformation>
> extends Ability<TAbilityUseContext, TAbilityUseResult> {
    protected abstract infoRequester: TInfoRequester;

    async isEligible(context: TAbilityUseContext): Promise<boolean> {
        return await this.infoRequester.isEligible(context);
    }

    async useWhenMalfunction(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        return await this.createRequestResult(
            {
                status: AbilitySuccessUseWhenMalfunction,
                description: await this.formatDescriptionForMalfunction(
                    context
                ),
            },
            context
        );
    }

    async useWhenNormal(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        const infoRequestContext: TInfoRequestContext =
            await this.createRequestContext(context);

        if (await this.infoRequester.isEligible(infoRequestContext)) {
            return await this.requestAndSendInfo(context, infoRequestContext);
        } else {
            return await this.createRequestResult(
                {
                    status: AbilityUseStatus.Success,
                    description:
                        await this.formatDescriptionForNotEligibleToRequestInfo(
                            context
                        ),
                },
                context,
                infoRequestContext
            );
        }
    }

    protected async requestAndSendInfo(
        context: TAbilityUseContext,
        infoRequestContext: TInfoRequestContext
    ): Promise<TAbilityUseResult> {
        const info = await this.infoRequester.request(infoRequestContext);
        const sendInfoReason = await this.formatReasonForSendInfo(
            context,
            infoRequestContext
        );
        await GAME_UI.send(context.requestedPlayer, info, sendInfoReason);

        return await this.createRequestResult(
            {
                status: AbilitySuccessCommunicatedInfo,
                description: await this.formatDescriptionForRequestAndSendInfo(
                    context,
                    infoRequestContext,
                    info
                ),
                info,
            },
            context,
            infoRequestContext
        );
    }

    protected abstract createRequestContext(
        context: TAbilityUseContext
    ): Promise<TInfoRequestContext>;

    protected abstract createRequestResultImpl(
        result: GetInfoAbilityUseResult<TInformation>,
        context?: TAbilityUseContext,
        infoRequestContext?: TInfoRequestContext
    ): Promise<TAbilityUseResult>;

    protected createRequestResult(
        result: GetInfoAbilityUseResult<TInformation>,
        context?: TAbilityUseContext,
        infoRequestContext?: TInfoRequestContext
    ): Promise<TAbilityUseResult> {
        return this.createRequestResultImpl(
            result,
            context,
            infoRequestContext
        );
    }

    protected formatDescriptionForNotEligibleToRequestInfo(
        context: TAbilityUseContext
    ): Promise<string> {
        return Promise.resolve(
            `Player ${context.requestedPlayer} is not eligible to get information`
        );
    }

    protected formatDescriptionForMalfunction(
        context: TAbilityUseContext
    ): Promise<string> {
        return Promise.resolve(
            `Player ${context.requestedPlayer} cannot get information when ability malfunctions`
        );
    }

    protected formatReasonForSendInfo(
        context: TAbilityUseContext,
        _infoRequestContext: TInfoRequestContext
    ): Promise<string> {
        return Promise.resolve(
            `Player ${
                context.requestedPlayer
            } need to get information for ability ${this.toString()}`
        );
    }

    protected formatDescriptionForRequestAndSendInfo(
        context: TAbilityUseContext,
        _infoRequestContext: TInfoRequestContext,
        _info: Info<TInformation>
    ): Promise<string> {
        return Promise.resolve(
            `Get info and send to player ${
                context.requestedPlayer
            } for ability ${this.toString()}`
        );
    }
}

export interface GetInformationAbilityUseResult<TInformation>
    extends GetInfoAbilityUseResult<TInformation> {
    isTrueInformation?: boolean;
}

abstract class GetInformationAbility<
    TInformation,
    TInformationRequestContext extends InformationRequestContext<TInformation>,
    TInformationRequester extends IInformationRequester<
        TInformation,
        TInformationRequestContext
    >,
    TAbilityUseContext extends GetInfoAbilityUseContext,
    TAbilityUseResult extends GetInformationAbilityUseResult<TInformation>
> extends GetInfoAbility<
    TInformation,
    TInformationRequestContext,
    TInformationRequester,
    TAbilityUseContext,
    TAbilityUseResult
> {
    async willMalfunction(context: TAbilityUseContext): Promise<boolean> {
        const willGetTrueInformation =
            await this.infoRequester.willGetTrueInformation(context);

        return !willGetTrueInformation;
    }

    async useWhenMalfunction(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        const result = await this.useWhenNormal(context);
        result.status |= AbilityUseStatus.Malfunction;
        return result;
    }

    protected async createRequestResult(
        result: GetInfoAbilityUseResult<TInformation>,
        context?: TAbilityUseContext,
        infoRequestContext?: TInformationRequestContext
    ): Promise<TAbilityUseResult> {
        const requestResult = await this.createRequestResultImpl(
            result,
            context,
            infoRequestContext
        );
        requestResult.isTrueInformation =
            infoRequestContext?.willGetTrueInformation;
        return requestResult;
    }
}

export abstract class GetCharacterInformationAbility<
    TInformation,
    TInformationRequester extends IInformationRequester<
        TInformation,
        InformationRequestContext<TInformation>
    >
> extends GetInformationAbility<
    TInformation,
    InformationRequestContext<TInformation>,
    TInformationRequester,
    GetInfoAbilityUseContext,
    GetInformationAbilityUseResult<TInformation>
> {
    createContext(...args: any[]): Promise<GetInfoAbilityUseContext> {
        return this.infoRequester.createContext(...args);
    }

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<InformationRequestContext<TInformation>> {
        const infoRequestContext: Omit<
            InformationRequestContext<TInformation>,
            'willGetTrueInformation'
        > = {
            ...context,
            requester: this.infoRequester,
            isStoryTellerInformation: false,
        };

        const willGetTrueInformation =
            await this.infoRequester.willGetTrueInformation(infoRequestContext);

        (
            infoRequestContext as InformationRequestContext<TInformation>
        ).willGetTrueInformation = willGetTrueInformation;

        return infoRequestContext as InformationRequestContext<TInformation>;
    }

    protected createRequestResultImpl(
        result: GetInfoAbilityUseResult<TInformation>,
        _context?: GetInfoAbilityUseContext,
        _infoRequestContext?: InformationRequestContext<TInformation>
    ): Promise<GetInformationAbilityUseResult<TInformation>> {
        return Promise.resolve(
            result as GetInformationAbilityUseResult<TInformation>
        );
    }
}

export class GetWasherwomanInformationAbility extends GetCharacterInformationAbility<
    WasherwomanInformation,
    WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >
> {
    /**
     * {@link `washerwoman["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Townsfolk.';

    protected infoRequester = new WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >();
}

export class GetLibrarianInformationAbility extends GetCharacterInformationAbility<
    LibrarianInformation,
    LibrarianInformationRequester<
        InformationRequestContext<LibrarianInformation>
    >
> {
    /**
     * {@link `librarian["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)';

    protected infoRequester = new LibrarianInformationRequester<
        InformationRequestContext<LibrarianInformation>
    >();
}

export class GetInvestigatorInformationAbility extends GetCharacterInformationAbility<
    InvestigatorInformation,
    InvestigatorInformationRequester<
        InformationRequestContext<InvestigatorInformation>
    >
> {
    /**
     * {@link `investigator["ability"]`}
     */
    static readonly description =
        'You start knowing that 1 of 2 players is a particular Minion.';

    protected infoRequester = new InvestigatorInformationRequester<
        InformationRequestContext<InvestigatorInformation>
    >();
}

export class GetChefInformationAbility extends GetCharacterInformationAbility<
    ChefInformation,
    ChefInformationRequester<InformationRequestContext<ChefInformation>>
> {
    /**
     * {@link `chef["ability"]`}
     */
    static readonly description =
        'You start knowing how many pairs of evil players there are.';

    protected infoRequester = new ChefInformationRequester<
        InformationRequestContext<ChefInformation>
    >();
}

export class GetEmpathInformationAbility extends GetCharacterInformationAbility<
    EmpathInformation,
    EmpathInformationRequester<InformationRequestContext<EmpathInformation>>
> {
    /**
     * {@link `empath["ability"]`}
     */
    static readonly description =
        'Each night, you learn how many of your 2 alive neighbours are evil.';

    protected infoRequester = new EmpathInformationRequester<
        InformationRequestContext<EmpathInformation>
    >();
}

class BaseRedHerringEffect extends Effect<FortuneTellerPlayer> {
    static readonly description =
        'A good player that registers as a Demon to Fortune Teller';

    static readonly origin: CharacterToken = FortuneTeller;

    constructor(protected readonly fortuneTellerPlayer: FortuneTellerPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<FortuneTellerPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'isDemon') &&
            this.matchNotNullInitiator<FortuneTellerPlayer>(
                context,
                (initiator) => this.fortuneTellerPlayer.equals(initiator)
            )
        );
    }

    apply(
        context: InteractionContext<FortuneTellerPlayer>,
        next: NextFunction<InteractionContext<FortuneTellerPlayer>>
    ): InteractionContext<FortuneTellerPlayer> {
        const updatedContext = next(context);
        updatedContext.result = Promise.resolve(true);
        return updatedContext;
    }
}

export const RedHerringEffect = CharacterNightEffect(BaseRedHerringEffect);

class BaseGetFortuneTellerInformationAbility extends GetCharacterInformationAbility<
    FortuneTellerInformation,
    FortuneTellerInformationRequester<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    >
> {
    /**
     * {@link `fortuneteller["ability"]`}
     */
    static readonly description =
        'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.';

    protected static canChoose(players: Array<Player> | undefined): boolean {
        return Array.isArray(players) && players.length === 2;
    }

    protected redHerringPlayer: Player | undefined;

    protected infoRequester = new FortuneTellerInformationRequester<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    >();

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.setupRedHerring(
            context.requestedPlayer,
            context.players,
            context.nightSheet
        );
    }

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    > {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            FortuneTellerInformationRequestContext<FortuneTellerInformation>,
            'chosenPlayers'
        >;
        const chosenPlayers = await this.choosePlayers(
            context.requestedPlayer,
            context.players,
            context
        );
        (
            infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>
        ).chosenPlayers = chosenPlayers;
        return infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>;
    }

    protected async choosePlayers(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<Player>,
        context: GetInfoAbilityUseContext
    ): Promise<[Player, Player]> {
        let chosen = (await GAME_UI.choose(
            fortuneTellerPlayer,
            players,
            2,
            BaseGetFortuneTellerInformationAbility.description
        )) as Array<Player> | undefined;

        if (!BaseGetFortuneTellerInformationAbility.canChoose(chosen)) {
            const error = new FortuneTellerChooseInvalidPlayers(
                fortuneTellerPlayer,
                chosen,
                context
            );
            await error.resolve();
            chosen = error.corrected;
        }

        return chosen as [Player, Player];
    }

    protected async setupRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<Player>,
        nightSheet: NightSheet
    ): Promise<void> {
        const redHerringPlayer = await this.chooseRedHerring(players);
        this.setRedHerring(fortuneTellerPlayer, redHerringPlayer, nightSheet);
    }

    protected async chooseRedHerring(
        players: Iterable<Player>
    ): Promise<Player> {
        return await GAME_UI.storytellerChooseOne(
            players,
            RedHerringEffect.description
        );
    }

    protected setRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        redHerringPlayer: Player,
        nightSheet: NightSheet
    ) {
        this.redHerringPlayer = redHerringPlayer;
        const effect = new RedHerringEffect(fortuneTellerPlayer);
        effect.setup(nightSheet);
        redHerringPlayer.effects.add(effect, CompositeGamePhaseKind.EveryNight);
    }
}

export interface GetFortuneTellerInformationAbility
    extends GetCharacterInformationAbility<
        FortuneTellerInformation,
        FortuneTellerInformationRequester<
            FortuneTellerInformationRequestContext<FortuneTellerInformation>
        >
    > {}

export const GetFortuneTellerInformationAbility = RequireSetup(
    BaseGetFortuneTellerInformationAbility
);

export class GetUndertakerInformationAbility extends GetCharacterInformationAbility<
    UndertakerInformation,
    UndertakerInformationRequester<
        UndertakerInformationRequestContext<UndertakerInformation>
    >
> {
    /**
     * {@link `Undertaker["ability"]`}
     */
    static readonly description =
        'Each night*, you learn which character died by execution today.';

    protected infoRequester = new UndertakerInformationRequester<
        UndertakerInformationRequestContext<UndertakerInformation>
    >();

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<UndertakerInformationRequestContext<UndertakerInformation>> {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            UndertakerInformationRequestContext<UndertakerInformation>,
            'executedPlayer'
        >;

        const executedPlayer = context.clocktower.today.executed;

        if (executedPlayer === undefined) {
            throw new UndertakerRequestInfoWhenNoExecution(
                context.requestedPlayer,
                context
            );
        } else {
            (
                infoRequestContext as UndertakerInformationRequestContext<UndertakerInformation>
            ).executedPlayer = executedPlayer;
        }

        return infoRequestContext as UndertakerInformationRequestContext<UndertakerInformation>;
    }
}

class BaseMonkProtectionEffect extends SafeFromDemonEffect<MonkPlayer> {
    static readonly description =
        'The Monk protects other players from the Demon.';

    static readonly origin: CharacterToken = Monk;
}

export const MonkProtectionEffect = CharacterNightEffect(
    BaseMonkProtectionEffect
);

export interface MonkAbilityUseResult extends AbilityUseResult {
    protectedPlayer?: Player;
}

class BaseMonkProtectAbility extends Ability<
    AbilityUseContext,
    MonkAbilityUseResult
> {
    /**
     * {@link `monk["ability"]`}
     */
    static readonly description =
        'Each night*, choose a player (not yourself): they are safe from the Demon tonight.';

    protected protected: Array<Player | undefined> = [];

    protected protection = new MonkProtectionEffect();

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.protection.setup(context.nightSheet);
    }

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<MonkAbilityUseResult> {
        const _playerToProtect = await this.choosePlayerToProtect(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToProtect();

        return {
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        };
    }

    async loseAbility(reason?: string): Promise<void> {
        await super.loseAbility(reason);
        await this.protection.deactivate(reason);
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<MonkAbilityUseResult> {
        const playerToProtect = await this.choosePlayerToProtect(
            context.requestedPlayer,
            context.players,
            context
        );
        this.updatePlayerToProtect(playerToProtect);

        return {
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(
                context,
                playerToProtect
            ),
            protectedPlayer: playerToProtect,
        };
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected updatePlayerToProtect(playerToProtect?: Player) {
        const previousPlayerToProtect = this.protected.at(-1);
        if (
            previousPlayerToProtect !== undefined &&
            (playerToProtect === undefined ||
                !playerToProtect.equals(previousPlayerToProtect))
        ) {
            previousPlayerToProtect.effects.delete(this.protection);
        }

        this.protected.push(playerToProtect);
        playerToProtect?.effects.add(
            this.protection,
            BasicGamePhaseKind.NonfirstNight
        );
    }

    protected async choosePlayerToProtect(
        monkPlayer: MonkPlayer,
        players: Players,
        context: AbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            monkPlayer,
            players.isNot(monkPlayer),
            1,
            BaseMonkProtectAbility.description
        )) as Player | undefined;

        if (chosen === undefined) {
            const error = new MonkNotChoosePlayerToProtect(monkPlayer, context);
            await error.resolve();
            chosen = error.correctedPlayerToProtect;
        }

        return chosen as Player;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Monk player ${context.requestedPlayer} cannot protect when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        playerToProtect: Player
    ): string {
        return `Monk player ${context.requestedPlayer} choose to protect ${playerToProtect}`;
    }
}

export interface MonkProtectAbility
    extends Ability<AbilityUseContext, MonkAbilityUseResult> {}

export const MonkProtectAbility = RequireSetup(BaseMonkProtectAbility);

export class GetRavenkeeperInformationAbility extends GetCharacterInformationAbility<
    RavenkeeperInformation,
    RavenkeeperInformationRequester<
        RavenkeeperInformationRequestContext<RavenkeeperInformation>
    >
> {
    /**
     * {@link `ravenkeeper["ability"]`}
     */
    static readonly description =
        'If you die at night, you are woken to choose a player: you learn their character.';

    protected infoRequester = new RavenkeeperInformationRequester<
        RavenkeeperInformationRequestContext<RavenkeeperInformation>
    >();

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<RavenkeeperInformationRequestContext<RavenkeeperInformation>> {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            RavenkeeperInformationRequestContext<RavenkeeperInformation>,
            'chosenPlayer'
        >;
        const chosenPlayer = await this.choosePlayer(
            context.requestedPlayer,
            context.players,
            context
        );
        (
            infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>
        ).chosenPlayer = chosenPlayer;
        return infoRequestContext as RavenkeeperInformationRequestContext<RavenkeeperInformation>;
    }

    protected async choosePlayer(
        ravenkeeperPlayer: RavenkeeperPlayer,
        players: Iterable<Player>,
        context: GetInfoAbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            ravenkeeperPlayer,
            players,
            1,
            GetRavenkeeperInformationAbility.description
        )) as Player;

        if (chosen === undefined) {
            const error = new RavenkeeperNotChoosePlayerToProtect(
                ravenkeeperPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedPlayer;
        }

        return chosen;
    }
}

export class NominateVirginPenalty extends Effect<Execution> {
    static readonly description =
        'The Virgin may inadvertently execute their accuser.';

    get hasNominatedVirgin(): boolean {
        return this._hasNominatedVirgin;
    }

    protected _hasNominatedVirgin = false;

    constructor(protected readonly virginPlayer: VirginPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<Execution>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'addNomination') &&
            !this._hasNominatedVirgin
        );
    }

    apply(
        context: InteractionContext<Execution>,
        next: NextFunction<InteractionContext<Execution>>
    ): InteractionContext<Execution> {
        const updatedContext = next(context);
        const execution = context.interaction.target as Execution;
        const originalAddNomination = (
            updatedContext.result as Execution['addNomination']
        ).bind(execution);

        const newAddNomination = async (
            nomination: Nomination
        ): Promise<boolean> => {
            const result = await originalAddNomination(nomination);

            if (
                nomination !== undefined &&
                nomination.nominated.equals(this.virginPlayer)
            ) {
                this._hasNominatedVirgin = true;

                if (await nomination.nominator.isTownsfolk) {
                    await execution.execute(
                        nomination.nominator,
                        DeadReason.NominateVirgin
                    );
                }
            }

            return result;
        };

        updatedContext.result = newAddNomination;
        return updatedContext;
    }
}

export interface VirginAbilityUseContext
    extends AbilityUseContext,
        RequireExecution {}

export class VirginAbility extends Ability<
    VirginAbilityUseContext,
    AbilityUseResult
> {
    /**
     * {@link `virgin["ability"]`}
     */
    static readonly description =
        'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.';

    get hasNominatedVirgin(): boolean {
        return this.penalty?.hasNominatedVirgin ?? false;
    }

    protected penalty?: NominateVirginPenalty;

    useWhenMalfunction(
        context: VirginAbilityUseContext
    ): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: VirginAbilityUseContext): Promise<AbilityUseResult> {
        this.addPenaltyToExecution(context.execution, context.requestedPlayer);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async isEligible(context: VirginAbilityUseContext): Promise<boolean> {
        return (await super.isEligible(context)) && !this.hasNominatedVirgin;
    }

    createContext(..._args: any[]): Promise<VirginAbilityUseContext> {
        // TODO
        throw new Error('Method not implemented.');
    }

    protected addPenaltyToExecution(
        execution: Execution,
        virginPlayer: VirginPlayer
    ) {
        if (this.penalty === undefined) {
            this.penalty = new NominateVirginPenalty(virginPlayer);
        }

        execution.effects.add(this.penalty, BasicGamePhaseKind.Other);
    }

    protected formatDescriptionForMalfunction(
        context: VirginAbilityUseContext
    ): string {
        return `Virgin player ${context.requestedPlayer} will not execute accuser when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: VirginAbilityUseContext
    ): string {
        return `Virgin player ${context.requestedPlayer} may inadvertently execute their accuser`;
    }
}

export interface SlayerAbilityUseResult extends AbilityUseResult {
    chosenPlayer: Player;
    death?: Death;
}

export class SlayerAbility extends Ability<
    AbilityUseContext,
    SlayerAbilityUseResult
> {
    /**
     * {@link `Slayer["ability"]`}
     */
    static readonly description =
        'Once per game, during the day, publicly choose a player: if they are the Demon, they die.';

    protected hasUsedAbility = false;

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<SlayerAbilityUseResult> {
        const chosenPlayer = await this.chooseSuspectedDemon(
            context.requestedPlayer,
            context.players,
            context
        );

        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            chosenPlayer,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<SlayerAbilityUseResult> {
        const chosenPlayer = await this.chooseSuspectedDemon(
            context.requestedPlayer,
            context.players,
            context
        );
        const death = await this.attemptToKillDemon(
            chosenPlayer,
            context.requestedPlayer
        );

        return Promise.resolve({
            status:
                death === undefined
                    ? AbilityUseStatus.Success
                    : AbilitySuccessUseWhenHasEffect,
            chosenPlayer,
            death,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async isEligible(context: AbilityUseContext): Promise<boolean> {
        return (await super.isEligible(context)) && !this.hasUsedAbility;
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected async attemptToKillDemon(
        player: Player,
        slayerPlayer: Player
    ): Promise<Death | undefined> {
        this.hasUsedAbility = true;
        if (await player.from(slayerPlayer).isTheDemon) {
            return await player.setDead(DeadReason.SlayerKill);
        }
    }

    protected async chooseSuspectedDemon(
        slayerPlayer: SlayerPlayer,
        players: Iterable<Player>,
        context: AbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            slayerPlayer,
            players,
            1,
            SlayerAbility.description
        )) as Player;

        if (chosen === undefined) {
            const error = new SlayerNotChoosePlayerToKill(
                slayerPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedPlayerToKill;
        }

        return chosen;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Slayer player ${context.requestedPlayer} can not kill the demon when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Slayer player ${context.requestedPlayer} may inadvertently execute their accuser`;
    }
}
export class SoldierSafeFromDemonEffect extends SafeFromDemonEffect<SoldierPlayer> {
    static readonly description = 'The Soldier can not be killed by the Demon.';

    isApplicable(context: InteractionContext<SoldierPlayer>): boolean {
        return super.isApplicable(context) && this.isTargetHasAbility(context);
    }
}

class BaseSoldierAbility extends Ability<AbilityUseContext, AbilityUseResult> {
    /**
     * {@link `Soldier["ability"]`}
     */
    static readonly description = 'You are safe from the Demon.';

    protected power: SoldierSafeFromDemonEffect =
        new SoldierSafeFromDemonEffect();

    useWhenMalfunction(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        context.requestedPlayer.effects.add(
            this.power,
            CompositeGamePhaseKind.EveryNight
        );
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Soldier player ${context.requestedPlayer} is not safe from the demon when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Soldier player ${context.requestedPlayer} is safe from the demon`;
    }
}

export interface SoldierAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

export const SoldierAbility = RequireSetup(BaseSoldierAbility);

export class MayorPeacefulWinEffect extends Effect<Game> {
    static readonly description =
        'The Mayor can win by peaceful means on the final day.';

    constructor(protected readonly mayorPlayer: MayorPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<Game>): boolean {
        return (
            super.isApplicable(context) &&
            this.mayorPlayer.hasAbility &&
            this.isGetProperty(context, 'getWinningTeam')
        );
    }

    apply(
        context: InteractionContext<Game>,
        next: NextFunction<InteractionContext<Game>>
    ): InteractionContext<Game> {
        const updatedContext = next(context);

        const game = context.interaction.target;
        const getWinningTeamMethod = updatedContext.result.bind();

        updatedContext.result = async (players: Iterable<Player>) => {
            const winningTeam = await getWinningTeamMethod(players);

            if (winningTeam === undefined && this.isPeacefulWin(game)) {
                return Alignment.Good;
            }

            return winningTeam;
        };
        return updatedContext;
    }

    protected isPeacefulWin(game: Game) {
        return !game.hasExecution && game.alivePlayers.count() === 3;
    }
}

export class MayorDieInsteadEffect extends Effect<MayorPlayer> {
    static readonly description =
        'If mayor die at night, another player might die instead.';

    constructor(protected readonly players: Players) {
        super();
    }

    isApplicable(context: InteractionContext<MayorPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isTargetHasAbility(context) &&
            this.matchDemonKill(context)
        );
    }

    apply(
        context: InteractionContext<MayorPlayer>,
        next: NextFunction<InteractionContext<MayorPlayer>>
    ): InteractionContext<MayorPlayer> {
        const updatedContext = next(context);

        const killer = context.initiator;
        const mayorPlayer = context.interaction.target;
        const setDeadMethod = updatedContext.result.bind(mayorPlayer);

        updatedContext.result = async (
            reason: DeadReason = DeadReason.Other
        ) => {
            const chosenPlayerToDie = await this.choosePlayerToDieInstead(
                this.players
            );

            if (chosenPlayerToDie.equals(mayorPlayer)) {
                // storyteller still chooses mayor to die
                return await setDeadMethod(reason);
            } else {
                return await chosenPlayerToDie.from(killer).setDead(reason);
            }
        };
        return updatedContext;
    }

    protected async choosePlayerToDieInstead(
        players: Iterable<Player>
    ): Promise<Player> {
        return (await GAME_UI.storytellerChooseOne(
            players,
            MayorDieInsteadEffect.description
        )) as Player;
    }
}

export interface MayorAbilitySetupContext
    extends AbilitySetupContext,
        RequireGame {}

class BaseMayorAbility extends Ability<
    AbilityUseContext,
    AbilityUseResult,
    MayorAbilitySetupContext
> {
    /**
     * {@link `mayor["ability"]`}
     */
    static readonly description =
        'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.';

    protected declare mayorDieInsteadEffect: MayorDieInsteadEffect;

    protected declare mayorPeacefulWinEffect: MayorPeacefulWinEffect;

    useWhenMalfunction(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async setup(context: MayorAbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.mayorDieInsteadEffect = new MayorDieInsteadEffect(context.players);
        context.requestedPlayer.effects.add(
            this.mayorDieInsteadEffect,
            CompositeGamePhaseKind.EveryNight
        );

        this.mayorPeacefulWinEffect = new MayorPeacefulWinEffect(
            context.requestedPlayer
        );
        context.game.effects.add(
            this.mayorPeacefulWinEffect,
            BasicGamePhaseKind.Other
        );
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext
    ): string {
        return `Mayor player ${context.requestedPlayer} cannot win by peaceful means and safe from dying at night when ability malfunctions`;
    }

    protected formatDescriptionForNormal(context: AbilityUseContext): string {
        return `Mayor player ${context.requestedPlayer} can win by peaceful means and safe from dying at night`;
    }
}

export interface MayorAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

export const MayorAbility = RequireSetup(BaseMayorAbility);

export class ButlerFollowMasterVoteEffect extends Effect<ButlerPlayer> {
    static readonly description =
        'The Butler may only vote when their Master (another player) votes.';

    declare master?: Player;

    constructor(protected readonly butlerPlayer: ButlerPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<ButlerPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isTargetHasAbility(context) &&
            this.master !== undefined &&
            this.isGetProperty(context, 'canVote')
        );
    }

    apply(
        context: InteractionContext<ButlerPlayer>,
        next: NextFunction<InteractionContext<ButlerPlayer>>
    ): InteractionContext<ButlerPlayer> {
        const updatedContext = next(context);
        updatedContext.result = this.canVote();
        return updatedContext;
    }

    protected canVote(): Promise<boolean> {
        return GAME_UI.hasRaisedHandForVote(this.master!);
    }
}

export interface ButlerAbilityUseResult extends AbilityUseResult {
    master: Player;
}

export class ButlerAbility extends Ability<
    AbilityUseContext,
    ButlerAbilityUseResult
> {
    /**
     * {@link `butler["ability"]`}
     */
    static readonly description =
        'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.';

    protected effect?: ButlerFollowMasterVoteEffect;

    async useWhenMalfunction(
        context: AbilityUseContext
    ): Promise<ButlerAbilityUseResult> {
        const master = await this.chooseMaster(
            context.requestedPlayer,
            context.players,
            context
        );

        await this.updateMaster(context.requestedPlayer);

        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            master,
            description: this.formatDescriptionForMalfunction(context, master),
        });
    }

    async useWhenNormal(
        context: AbilityUseContext
    ): Promise<ButlerAbilityUseResult> {
        const master = await this.chooseMaster(
            context.requestedPlayer,
            context.players,
            context
        );

        await this.updateMaster(context.requestedPlayer, master);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            master,
            description: this.formatDescriptionForNormal(context, master),
        });
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO
        throw new Error('Method not implemented.');
    }

    protected async updateMaster(butlerPlayer: ButlerPlayer, master?: Player) {
        if (this.effect === undefined) {
            this.effect = new ButlerFollowMasterVoteEffect(butlerPlayer);
            butlerPlayer.effects.add(this.effect, BasicGamePhaseKind.Other);
        }

        this.effect.master = master;
        if (master === undefined && this.effect.active) {
            await this.effect.deactivate(
                'Butler can vote normally when ability malfunctions'
            );
        } else if (master !== undefined && !this.effect.active) {
            await this.effect.reactivate(
                'The Butler may only vote when their Master votes if ability does not malfunction'
            );
        }
    }

    protected async chooseMaster(
        butlerPlayer: ButlerPlayer,
        players: Players,
        context: AbilityUseContext
    ): Promise<Player> {
        let chosen = (await GAME_UI.choose(
            butlerPlayer,
            players.isNot(butlerPlayer),
            1,
            ButlerAbility.description
        )) as Player;

        if (chosen === undefined) {
            const error = new ButlerNotChooseMasterToFollow(
                butlerPlayer,
                context
            );
            await error.resolve();
            chosen = error.correctedMaster;
        }

        return chosen;
    }

    protected formatDescriptionForMalfunction(
        context: AbilityUseContext,
        master: Player
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master. But due to ability malfunction, Butler player's vote will be counted normally`;
    }

    protected formatDescriptionForNormal(
        context: AbilityUseContext,
        master: Player
    ): string {
        return `Butler player ${context.requestedPlayer} chooses player ${master} as master.`;
    }
}

class RecluseRegisterAsEvilAlignmentEffect extends RegisterAsGoodAlignmentEffect<ReclusePlayer> {
    protected formatPromptForChoose(
        context: InteractionContext<ReclusePlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Recluse might register as evil.`;
    }
}

class RecluseRegisterAsEvilCharacterEffect extends RegisterAsCharacterEffect<ReclusePlayer> {
    readonly recommended = undefined;

    static fromCharacterSheet(characterSheet: CharacterSheet) {
        return this.from(characterSheet.minion, characterSheet.demon);
    }

    static from(minions: Array<CharacterToken>, demons: Array<CharacterToken>) {
        const evilCharacters = Generator.cache(
            Generator.chain(minions, demons)
        );
        return new this(evilCharacters as CachingGenerator<CharacterToken>);
    }

    get options() {
        return this.evilCharacters;
    }

    protected readonly evilCharacters:
        | Array<CharacterToken>
        | CachingGenerator<CharacterToken>;

    protected constructor(
        evilCharacters: Array<CharacterToken> | CachingGenerator<CharacterToken>
    ) {
        super();
        this.evilCharacters = evilCharacters;
    }

    protected formatPromptForChoose(
        context: InteractionContext<ReclusePlayer>
    ): string {
        const prompt = super.formatPromptForChoose(context);
        return `${prompt} Recluse might appear to be an evil character.`;
    }
}

class BaseRecluseAbility extends Ability<AbilityUseContext, AbilityUseResult> {
    /**
     * {@link `recluse["ability"]`}
     */
    static readonly description =
        'You might register as evil & as a Minion or Demon, even if dead.';

    protected declare registerAsAlignment: RecluseRegisterAsEvilAlignmentEffect;

    protected declare registerAsCharacter: RecluseRegisterAsEvilCharacterEffect;

    useWhenNormal(context: AbilityUseContext): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilityUseStatus.Success,
            description: this.formatDescription(context),
        });
    }

    useWhenMalfunction = this.useWhenNormal;

    isEligible(_context: AbilityUseContext): Promise<boolean> {
        return Promise.resolve(false);
    }

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.registerAsAlignment = new RecluseRegisterAsEvilAlignmentEffect();
        this.registerAsCharacter =
            RecluseRegisterAsEvilCharacterEffect.fromCharacterSheet(
                context.characterSheet
            );

        context.requestedPlayer.effects.add(
            this.registerAsAlignment,
            CompositeGamePhaseKind.ALL
        );
        context.requestedPlayer.effects.add(
            this.registerAsCharacter,
            CompositeGamePhaseKind.ALL
        );
    }

    willMalfunction(_context: AbilityUseContext): Promise<boolean> {
        return Promise.resolve(false);
    }

    createContext(..._args: any[]): Promise<AbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected formatDescription(context: AbilityUseContext): string {
        return `The Recluse player ${context.requestedPlayer} might appear to be an evil character, but is actually good.`;
    }
}

export interface RecluseAbility
    extends Ability<AbilityUseContext, AbilityUseResult> {}

export const RecluseAbility = RequireSetup(BaseRecluseAbility);

export class SaintEndsGamePenalty extends Effect<Execution> {
    static readonly description =
        'The Saint ends the game if they are executed.';

    constructor(
        protected readonly saintPlayer: SaintPlayer,
        protected readonly game: Game
    ) {
        super();
    }

    isApplicable(context: InteractionContext<Execution>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'execute')
        );
    }

    apply(
        context: InteractionContext<Execution>,
        next: NextFunction<InteractionContext<Execution>>
    ): InteractionContext<Execution> {
        const updatedContext = next(context);
        const execution = context.interaction.target as Execution;
        const originalExecute = (
            updatedContext.result as Execution['execute']
        ).bind(execution);

        const newAddNomination: Execution['execute'] = async (
            player,
            deadReason
        ) => {
            const death = await originalExecute(player, deadReason);

            if (death !== undefined && death.isFor(this.saintPlayer)) {
                await this.endGame();
            }

            return death;
        };

        updatedContext.result = newAddNomination;
        return updatedContext;
    }

    protected async endGame() {
        const alignment = await this.saintPlayer.alignment;
        this.game.setWinningTeam(alignment, SaintEndsGamePenalty.description);
    }
}

export interface SaintAbilitySetupContext
    extends AbilitySetupContext,
        RequireGame {}

export interface SaintAbilityUseContext
    extends AbilityUseContext,
        RequireExecution {}

class BaseSaintAbility extends Ability<
    SaintAbilityUseContext,
    AbilityUseResult,
    SaintAbilitySetupContext
> {
    /**
     * {@link `saint["ability"]`}
     */
    static readonly description = 'If you die by execution, your team loses.';

    declare penalty: SaintEndsGamePenalty;

    useWhenMalfunction(
        context: SaintAbilityUseContext
    ): Promise<AbilityUseResult> {
        return Promise.resolve({
            status: AbilitySuccessUseWhenMalfunction,
            description: this.formatDescriptionForMalfunction(context),
        });
    }

    useWhenNormal(context: SaintAbilityUseContext): Promise<AbilityUseResult> {
        this.addPenaltyToExecution(context.execution);

        return Promise.resolve({
            status: AbilitySuccessUseWhenHasEffect,
            description: this.formatDescriptionForNormal(context),
        });
    }

    async setup(context: MayorAbilitySetupContext): Promise<void> {
        await super.setup(context);

        this.penalty = new SaintEndsGamePenalty(
            context.requestedPlayer,
            context.game
        );
    }

    createContext(..._args: any[]): Promise<SaintAbilityUseContext> {
        // TODO choose player will be moved here
        throw new Error('Method not implemented.');
    }

    protected addPenaltyToExecution(execution: Execution) {
        execution.effects.add(this.penalty, BasicGamePhaseKind.Other);
    }

    protected formatDescriptionForMalfunction(
        context: SaintAbilityUseContext
    ): string {
        return `Saint player ${context.requestedPlayer} will not end the game when executed when ability malfunctions`;
    }

    protected formatDescriptionForNormal(
        context: SaintAbilityUseContext
    ): string {
        return `Saint player ${context.requestedPlayer} will end the game when executed`;
    }
}

export interface SaintAbility
    extends Ability<
        SaintAbilityUseContext,
        AbilityUseResult,
        SaintAbilitySetupContext
    > {}

export const SaintAbility = RequireSetup(BaseSaintAbility);
