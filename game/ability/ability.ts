import {
    AbilityCanOnlyUseOnce,
    AbilityRequiresSetup,
    RecoverableGameError,
} from '../exception';
import type {
    AsyncFactory,
    Constructor,
    IBindToCharacter,
    IBindToCharacterType,
    StaticThis,
} from '../types';
import type { CharacterSheet } from '../character-sheet';
import type { NightSheet } from '../night-sheet';
import type { IPlayer } from '../player';
import type { Players } from '../players';
import type { Info } from '../info/info';
import type { InfoProvideContext } from '../info/provider/provider';
import type {
    InfoRequestContext,
    IInfoRequester,
    InformationRequestContext,
    IInformationRequester,
} from '../info/requester/requester';
import type { IClocktower } from '../clocktower';
import type { ICharacterTypeInformationRequester } from '../info/requester/common';
import type { IAbilityLoader } from './loader';
import {
    AbilitySuccessCommunicatedInfo,
    AbilitySuccessUseWhenMalfunction,
    AbilityUseStatus,
} from './status';
import { InteractionEnvironment } from '~/interaction/environment';

export interface AbilityUseContext {
    requestedPlayer: IPlayer;
    players: Players;
}

export interface AbilitySetupContext extends AbilityUseContext {
    nightSheet: NightSheet;
    characterSheet: CharacterSheet;
    abilityLoader: IAbilityLoader;
    clocktower: IClocktower;
}

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

    /**
     * Whether this ability is eligible to use.
     *
     * For example, an ability might be ineligible when its player is dead or the ability can only be used once.
     * @param context An context for using the ability.
     * @returns A promise that resolves to whether the ability is eligible to use.
     */
    isEligible(context: TAbilityUseContext): Promise<boolean>;

    /**
     * Whether this ability will malfunction, such as when the player is drunk or poisoned. When an ability malfunctions, its player might receive false info or has no ability.
     * @param context An context for using the ability.
     * @returns A promise that resolves to whether the ability will malfunction.
     */
    willMalfunction(context: TAbilityUseContext): Promise<boolean>;

    setup(context: TAbilitySetupContext): Promise<void>;

    use(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    loseAbility(reason?: string): Promise<void>;

    /**
     * Create an context for using the ability.
     * @param args Arguments for creating the context.
     * @returns A promise that resolves to the constructed context.
     */
    createContext(...args: any[]): Promise<TAbilityUseContext>;
}

export type ICharacterAbilityClass<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext = AbilitySetupContext
> = Constructor<
    IAbility<TAbilityUseContext, TAbilityUseResult, TAbilitySetupContext>
> &
    IBindToCharacter;

export type ICharacterTypeAbilityClass<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext = AbilitySetupContext
> = Constructor<
    IAbility<TAbilityUseContext, TAbilityUseResult, TAbilitySetupContext>
> &
    IBindToCharacterType;

/**
 * {@link `glossary["Ability"]`}
 * The special power or penalty of a character, printed on its character token, the character sheet for the chosen edition, and the character almanac for the chosen edition. The definitive text of the ability is printed in the “How to Run” section of the character almanac. Characters have no ability when dead, drunk, or poisoned.
 */
export abstract class Ability<
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

    /**
     * Use an ability when it will malfunction.
     * @param context An context for using the ability.
     * @returns The result of using the ability.
     */
    abstract useWhenMalfunction(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    /**
     * Use an ability when it will not malfunction.
     * @param context An context for using the ability.
     * @returns The result of using the ability.
     */
    abstract useWhenNormal(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult>;

    abstract createContext(...args: any[]): Promise<TAbilityUseContext>;

    isEligible(context: TAbilityUseContext): Promise<boolean> {
        return context.requestedPlayer.alive;
    }

    setup(_context: TAbilitySetupContext): Promise<void> {
        this._hasSetup = true;
        return Promise.resolve(undefined);
    }

    loseAbility(_reason?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    use(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        return this.handleUnexpectedErrorDuringUse(() =>
            this.handleRecoverableErrorDuringUse(() => this.tryUse(context))
        );
    }

    async willMalfunction(context: TAbilityUseContext): Promise<boolean> {
        return !(await context.requestedPlayer.hasAbility);
    }

    toString(): string {
        return this.constructor.name;
    }

    protected async tryUse(
        context: TAbilityUseContext
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        if (await this.willMalfunction(context)) {
            return await this.useWhenMalfunction(context);
        } else {
            return await this.useWhenNormal(context);
        }
    }

    protected async handleUnexpectedErrorDuringUse(
        action: AsyncFactory<TAbilityUseResult | AbilityUseResult>
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        try {
            return await action();
        } catch (error) {
            return {
                status: AbilityUseStatus.Failure,
                description: Ability.REASON_FOR_UNEXPECTED_ERROR,
                error: error as Error,
            };
        }
    }

    protected async handleRecoverableErrorDuringUse(
        action: AsyncFactory<TAbilityUseResult | AbilityUseResult>
    ): Promise<TAbilityUseResult | AbilityUseResult> {
        return await RecoverableGameError.catch<
            RecoverableGameError,
            TAbilityUseResult | AbilityUseResult
        >(action, (error) =>
            Promise.resolve({
                status: error.handled
                    ? AbilityUseStatus.Failure | AbilityUseStatus.ErrorHandled
                    : AbilityUseStatus.Failure,
                reason: error.handled
                    ? Ability.REASON_FOR_HANDLED_ERROR
                    : Ability.REASON_FOR_UNEXPECTED_ERROR,
                error,
            })
        );
    }
}

export function RequireSetup<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext,
    TAbility extends Constructor<
        Ability<TAbilityUseContext, TAbilityUseResult, TAbilitySetupContext>
    >
>(AbilityClass: TAbility) {
    return class RequireSetup extends AbilityClass {
        declare createContext;

        declare useWhenNormal;

        declare useWhenMalfunction;

        protected async tryUse(
            context: TAbilityUseContext
        ): Promise<TAbilityUseResult | AbilityUseResult> {
            if (!this.hasSetup) {
                throw new AbilityRequiresSetup(this, context);
            }

            return await super.tryUse(context);
        }
    };
}

export function Once<
    TAbilityUseContext extends AbilityUseContext,
    TAbilityUseResult extends AbilityUseResult,
    TAbilitySetupContext extends AbilitySetupContext,
    TAbility extends Constructor<
        Ability<TAbilityUseContext, TAbilityUseResult, TAbilitySetupContext>
    >
>(AbilityClass: TAbility) {
    return class Once extends AbilityClass {
        protected hasUsedAbility = false;

        declare createContext;

        declare useWhenNormal;

        declare useWhenMalfunction;

        async isEligible(context: TAbilityUseContext): Promise<boolean> {
            return (await super.isEligible(context)) && !this.hasUsedAbility;
        }

        async tryUse(
            context: TAbilityUseContext
        ): Promise<TAbilityUseResult | AbilityUseResult> {
            if (this.hasUsedAbility) {
                throw new AbilityCanOnlyUseOnce(this, context);
            } else {
                this.hasUsedAbility = true;
                return await super.tryUse(context);
            }
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
        await InteractionEnvironment.current.gameUI.send(
            context.requestedPlayer,
            info,
            sendInfoReason
        );

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

export abstract class GetCharacterTypeInformationAbility<
    TInformation,
    TInformationRequester extends ICharacterTypeInformationRequester<
        TInformation,
        InformationRequestContext<TInformation>
    >
> extends GetCharacterInformationAbility<TInformation, TInformationRequester> {}