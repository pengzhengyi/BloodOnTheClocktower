import {
    FortuneTellerChooseInvalidPlayers,
    RecoverableGameError,
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
    UndertakerInformationRequestContext,
    UndertakerInformationRequester,
    WasherwomanInformationRequester,
} from './inforequester';
import { Effect, InteractionContext } from './effect';
import type { NextFunction } from './middleware';
import type { Player } from './player';
import type { InfoProvideContext } from './infoprovider';
import type {
    ChefInformation,
    EmpathInformation,
    FortuneTellerInformation,
    Info,
    InvestigatorInformation,
    LibrarianInformation,
    UndertakerInformation,
    WasherwomanInformation,
} from './information';
import { GAME_UI } from '~/interaction/gameui';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';

export interface AbilityUseContext {
    requestedPlayer: Player;
}

export enum AbilityUseStatus {
    Failure = 0,

    ErrorHandled = 0b1,

    Success = 0b10,

    HasInfo = 0b100,

    Communicated = 0b1000,
}

export interface AbilityUseResult {
    status: number;

    description?: string;

    error?: Error;
}

export interface IAbility<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> {
    isEligible(context: TAbilityUseContext): Promise<boolean>;

    willMalfunction(context: TAbilityUseContext): Promise<boolean>;

    use(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    createContext(...args: any[]): Promise<TAbilityUseContext>;
}

/**
 * {@link `glossary["Ability"]`}
 * The special power or penalty of a character, printed on its character token, the character sheet for the chosen edition, and the character almanac for the chosen edition. The definitive text of the ability is printed in the “How to Run” section of the character almanac. Characters have no ability when dead, drunk, or poisoned.
 */
abstract class Ability<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult
> implements IAbility<TAbilityUseContext, TAbilityUseResult>
{
    static readonly REASON_FOR_UNEXPECTED_ERROR =
        'Unexpected error encountered during ability use';

    static readonly REASON_FOR_HANDLED_ERROR =
        'Recoverable error encountered and handled during ability use';

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
        return Promise.resolve(
            context.requestedPlayer.drunk ||
                context.requestedPlayer.poisoned ||
                context.requestedPlayer.dead
        );
    }

    toString(): string {
        return this.constructor.name;
    }
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
                status: AbilityUseStatus.Success,
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
                status:
                    AbilityUseStatus.Success |
                    AbilityUseStatus.HasInfo |
                    AbilityUseStatus.Communicated,
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

    useWhenMalfunction = this.useWhenNormal;

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

abstract class GetCharacterInformationAbility<
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

export type FortuneTellerPlayer = Player & {
    character: FortuneTeller;
};

export class RedHerringEffect extends Effect<FortuneTellerPlayer> {
    static readonly description =
        'A good player that registers as a Demon to Fortune Teller';

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
        updatedContext.result = true;
        return updatedContext;
    }
}

export class GetFortuneTellerInformationAbility extends GetCharacterInformationAbility<
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

    async use(
        context: GetInfoAbilityUseContext
    ): Promise<
        | GetInformationAbilityUseResult<FortuneTellerInformation>
        | AbilityUseResult
    > {
        if (this.redHerringPlayer === undefined) {
            await this.setupRedHerring(
                context.requestedPlayer,
                context.players
            );
        }

        return await super.use(context);
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
            context.players
        );
        (
            infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>
        ).chosenPlayers = chosenPlayers;
        return infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>;
    }

    protected async choosePlayers(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<Player>
    ): Promise<[Player, Player]> {
        let chosen = (await GAME_UI.choose(
            fortuneTellerPlayer,
            players,
            2,
            GetFortuneTellerInformationAbility.description
        )) as Array<Player> | undefined;

        if (!GetFortuneTellerInformationAbility.canChoose(chosen)) {
            const error = new FortuneTellerChooseInvalidPlayers(
                fortuneTellerPlayer,
                chosen
            );
            await error.resolve();
            chosen = error.corrected;
        }

        return chosen as [Player, Player];
    }

    protected async setupRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<Player>
    ): Promise<void> {
        const redHerringPlayer = await this.chooseRedHerring(players);
        this.setRedHerring(fortuneTellerPlayer, redHerringPlayer);
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
        redHerringPlayer: Player
    ) {
        this.redHerringPlayer = redHerringPlayer;
        const effect = new RedHerringEffect(fortuneTellerPlayer);
        redHerringPlayer.effects.add(effect);
    }
}

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
