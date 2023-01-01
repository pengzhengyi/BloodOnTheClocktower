import { RecoverableGameError } from './exception';
import {
    IInfoRequester,
    IInformationRequester,
    InfoRequestContext,
    InformationRequestContext,
    WasherwomanInformationRequester,
} from './inforequester';
import type { Player } from './player';
import type { InfoProvideContext } from './infoprovider';
import type { Info, WasherwomanInformation } from './information';
import { GAME_UI } from '~/interaction/gameui';

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
        const infoRequestContext = await this.createRequestContext(context);

        const willGetTrueInformation =
            infoRequestContext.willGetTrueInformation ??
            (await this.infoRequester.willGetTrueInformation(
                infoRequestContext
            ));

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
    protected infoRequester = new WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >();
}
