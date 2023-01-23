import { Alignment } from './alignment';
import { CharacterEffectOriginNotSetup } from './exception';
import { BasicGamePhaseKind, GamePhaseKind } from './game-phase-kind';
import { Constructor, Predicate } from './types';
import type { CharacterToken } from './character';
import type { NightSheet } from './night-sheet';
import type { DeadReason } from './dead-reason';
import type { IMiddleware, NextFunction } from './proxy/middleware';
import type { IPlayer } from './player';
import { Environment } from '~/interaction/environment';

interface ProxyHandlerRequest<TTarget extends object> {
    trap: keyof ProxyHandler<TTarget>;
    target: TTarget;
    args: any[];
}

export type Interaction<TTarget extends object> = ProxyHandlerRequest<TTarget>;

export type InteractionResult = any;

export type InteractionInitiator = any;

export interface InteractionContext<TTarget extends object> {
    interaction: Interaction<TTarget>;
    result?: InteractionResult;
    initiator?: InteractionInitiator;
}

export interface Effect<TTarget extends object>
    extends IMiddleware<InteractionContext<TTarget>> {
    /**
     * Determine whether the effect will trigger under a given context
     * @param context The context under which the interaction request might trigger the effect.
     */
    isApplicable(context: InteractionContext<TTarget>): boolean;

    /**
     * Get the priority of an effect for a given game phase.
     *
     * For example, priority might differ for first night, during the day, and other nights.
     * @param gamePhaseKind A category of game phase.
     * @returns The priority of this effect in current game phase.
     */
    getPriority(gamePhaseKind: GamePhaseKind): number;
}

/**
 * Effect is the influence resulting from player's character ability. Effect can impact either the state of the game or players.
 */
export abstract class Effect<TTarget extends object> {
    protected _active = true;

    get active(): boolean {
        return this._active;
    }

    async deactivate(reason?: string): Promise<boolean> {
        if (
            await Environment.current.gameUI.storytellerConfirm(
                this.formatDeactivatePrompt(reason)
            )
        ) {
            this._active = false;
            return true;
        }

        return false;
    }

    async reactivate(reason?: string): Promise<boolean> {
        if (
            await Environment.current.gameUI.storytellerConfirm(
                this.formatReactivatePrompt(reason)
            )
        ) {
            this._active = true;
            return true;
        }

        return false;
    }

    getPriority(gamePhaseKind: BasicGamePhaseKind): number {
        switch (gamePhaseKind) {
            case BasicGamePhaseKind.FirstNight:
                return this.getPriorityForFirstNightGamePhaseKind();
            case BasicGamePhaseKind.NonfirstNight:
                return this.getPriorityForNonfirstNightGamePhaseKind();
            case BasicGamePhaseKind.Other:
                return this.getPriorityForOtherGamePhaseKind();
        }
    }

    isApplicable(_context: InteractionContext<TTarget>): boolean {
        return this.active;
    }

    apply(
        _context: InteractionContext<TTarget>,
        _next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        throw new Error('Method not implemented.');
    }

    toString(): string {
        return this.constructor.name;
    }

    protected getPriorityForFirstNightGamePhaseKind() {
        return Number.MIN_SAFE_INTEGER;
    }

    protected getPriorityForNonfirstNightGamePhaseKind() {
        return Number.MIN_SAFE_INTEGER;
    }

    protected getPriorityForOtherGamePhaseKind() {
        return Number.MIN_SAFE_INTEGER;
    }

    protected isTrap(
        context: InteractionContext<TTarget>,
        trap: keyof ProxyHandler<TTarget>
    ): boolean {
        return context.interaction.trap === trap;
    }

    protected matchTrap(
        context: InteractionContext<TTarget>,
        predicate: Predicate<keyof ProxyHandler<TTarget>>
    ) {
        return predicate(context.interaction.trap);
    }

    protected isInitiator(
        context: InteractionContext<TTarget>,
        initiator: InteractionInitiator
    ): boolean {
        return context.initiator === initiator;
    }

    protected matchInitiator<T = InteractionInitiator>(
        context: InteractionContext<TTarget>,
        predicate: Predicate<T>
    ) {
        return predicate(context.initiator);
    }

    protected matchTarget(
        context: InteractionContext<TTarget>,
        predicate: Predicate<TTarget>
    ) {
        return predicate(context.interaction.target);
    }

    protected isTargetHasAbility(
        context: InteractionContext<IPlayer>
    ): boolean {
        return context.interaction.target.storytellerGet('_hasAbility');
    }

    protected matchNotNullInitiator<T = InteractionInitiator>(
        context: InteractionContext<TTarget>,
        predicate: Predicate<NonNullable<T>>
    ) {
        if (context.initiator === null || context.initiator === undefined) {
            return false;
        }

        return predicate(context.initiator);
    }

    protected matchNotNullInitiatorSameAsTarget(
        context: InteractionContext<TTarget>
    ) {
        return this.matchNotNullInitiator<IPlayer>(context, (initiator) =>
            initiator.equals(context.interaction.target as IPlayer)
        );
    }

    protected matchNotNullInitiatorDifferentThanTarget(
        context: InteractionContext<TTarget>
    ) {
        return this.matchNotNullInitiator<IPlayer>(
            context,
            (initiator) =>
                !initiator.equals(context.interaction.target as IPlayer)
        );
    }

    protected matchArgs(
        context: InteractionContext<TTarget>,
        predicate: Predicate<any[]>
    ) {
        return predicate(context.interaction.args);
    }

    protected matchFirstArg<T>(
        context: InteractionContext<TTarget>,
        predicate: Predicate<T>
    ) {
        return predicate(context.interaction.args[0]);
    }

    protected matchDemonKill(context: InteractionContext<TTarget>) {
        return (
            this.isGetProperty(context, 'setDead' as keyof TTarget) &&
            this.matchNotNullInitiator<IPlayer>(context, (initiator) =>
                initiator.storytellerGet('_isDemon')
            )
        );
    }

    protected isGetProperty(
        context: InteractionContext<TTarget>,
        property: keyof TTarget
    ) {
        return (
            this.isTrap(context, 'get') &&
            this.matchFirstArg<string>(
                context,
                (actualProperty) => property === actualProperty
            )
        );
    }

    protected formatDeactivatePrompt(reason?: string): string {
        return `should deactivate ${this.toString()}${
            reason === undefined ? '' : ' because ' + reason
        }?`;
    }

    protected formatReactivatePrompt(reason?: string): string {
        return `should reactivate ${this.toString()}${
            reason === undefined ? '' : ' because ' + reason
        }?`;
    }
}

export class Forwarding<TTarget extends object> extends Effect<TTarget> {
    // eslint-disable-next-line no-use-before-define
    private static _instance: Forwarding<object>;

    static instance<TTarget extends object>(): Forwarding<TTarget> {
        return (this._instance ||
            (this._instance = new this<TTarget>())) as Forwarding<TTarget>;
    }

    getPriority(_gamePhaseKind: GamePhaseKind): number {
        return Number.NEGATIVE_INFINITY;
    }

    apply(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        if (context.result === undefined) {
            // @ts-ignore: allow dynamically invocation of Reflect methods
            context.result = Reflect[context.interaction.trap].apply(null, [
                context.interaction.target,
                ...context.interaction.args,
            ]);
        }

        return next(context);
    }
}

export abstract class SafeFromDemonEffect<
    TPlayer extends object
> extends Effect<TPlayer> {
    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return super.isApplicable(context) && this.matchDemonKill(context);
    }

    apply(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        const updatedContext = next(context);
        updatedContext.result = (_reason: DeadReason) =>
            Promise.resolve(undefined);
        return updatedContext;
    }
}

interface WithOrigin {
    origin: CharacterToken;
}

export type TCharacterEffect<TTarget extends object> = Effect<TTarget> &
    WithOrigin;

export interface TCharacterEffectConstructor<TTarget extends object>
    extends Constructor<Effect<TTarget>>,
        WithOrigin {}

export function CharacterEffect<
    TTarget extends object,
    TEffectConstructor extends TCharacterEffectConstructor<TTarget>
>(effectConstructor: TEffectConstructor) {
    return class CharacterEffect
        extends effectConstructor
        implements TCharacterEffect<TTarget>
    {
        declare static readonly origin: CharacterToken;

        apply(
            context: InteractionContext<TTarget>,
            next: NextFunction<InteractionContext<TTarget>>
        ): InteractionContext<TTarget> {
            return super.apply(context, next);
        }

        get origin(): CharacterToken {
            const origin = (this.constructor as any).origin;
            if (origin === undefined) {
                throw new CharacterEffectOriginNotSetup(this);
            }

            return origin;
        }
    };
}

export function CharacterNightEffect<
    TTarget extends object,
    TEffectConstructor extends TCharacterEffectConstructor<TTarget>
>(effectConstructor: TEffectConstructor) {
    return class CharacterNightEffect extends CharacterEffect(
        effectConstructor
    ) {
        protected firstNightPriority?: number;

        protected otherNightPriority?: number;

        apply(
            context: InteractionContext<TTarget>,
            next: NextFunction<InteractionContext<TTarget>>
        ): InteractionContext<TTarget> {
            return super.apply(context, next);
        }

        setup(nightSheet: NightSheet): [number, number] {
            return this.setupNightPriority(nightSheet);
        }

        protected setupNightPriority(nightSheet: NightSheet): [number, number] {
            this.firstNightPriority = nightSheet.getNightPriority(
                this.origin,
                true
            );
            this.otherNightPriority = nightSheet.getNightPriority(
                this.origin,
                false
            );

            return [this.firstNightPriority, this.otherNightPriority];
        }

        protected getPriorityForFirstNightGamePhaseKind(): number {
            return (
                this.firstNightPriority ??
                super.getPriorityForFirstNightGamePhaseKind()
            );
        }

        protected getPriorityForNonfirstNightGamePhaseKind(): number {
            return (
                this.otherNightPriority ??
                super.getPriorityForNonfirstNightGamePhaseKind()
            );
        }
    };
}

export abstract class RegisterAsEffect<
    TPlayer extends IPlayer,
    V
> extends Effect<TPlayer> {
    abstract readonly propertyName: keyof TPlayer;

    abstract readonly options: Iterable<V>;

    abstract readonly recommended?: V;

    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.matchNotNullInitiatorDifferentThanTarget(context) &&
            this.isGetProperty(context, this.propertyName)
        );
    }

    apply(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        const updatedContext = next(context);
        const registerAs = this.choose(context);
        updatedContext.result = registerAs;
        return updatedContext;
    }

    protected async choose(context: InteractionContext<TPlayer>): Promise<V> {
        return await Environment.current.gameUI.storytellerChooseOne(
            this.options,
            this.formatPromptForChoose(context),
            this.recommended
        );
    }

    protected formatPromptForChoose(
        context: InteractionContext<TPlayer>
    ): string {
        const recommendation =
            this.recommended === undefined
                ? ''
                : ` (recommended: ${this.recommended})`;

        return `Choose ${this.propertyName as string} for player ${
            context.interaction.target
        }${recommendation}.`;
    }
}

export abstract class RegisterAsAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsEffect<TPlayer, Alignment> {
    static readonly options = [Alignment.Good, Alignment.Evil];

    abstract readonly alignment: Alignment;

    readonly propertyName = 'alignment';

    get recommended() {
        return this.alignment;
    }

    get options(): Array<Alignment> {
        return RegisterAsAlignmentEffect.options;
    }
}

export abstract class RegisterAsGoodAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsAlignmentEffect<TPlayer> {
    readonly alignment = Alignment.Good;
}

export abstract class RegisterAsEvilAlignmentEffect<
    TPlayer extends IPlayer
> extends RegisterAsAlignmentEffect<TPlayer> {
    readonly alignment = Alignment.Evil;
}

export abstract class RegisterAsCharacterEffect<
    TPlayer extends IPlayer
> extends RegisterAsEffect<TPlayer, CharacterToken> {
    readonly propertyName = 'character';
}

export abstract class ThinkAsEffect<
    TPlayer extends IPlayer,
    V
> extends Effect<TPlayer> {
    abstract readonly propertyName: keyof TPlayer;

    abstract readonly thinkAs: V;

    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.matchNotNullInitiatorSameAsTarget(context) &&
            this.isGetProperty(context, this.propertyName)
        );
    }

    apply(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        const updatedContext = next(context);
        updatedContext.result = Promise.resolve(this.thinkAs);
        return updatedContext;
    }
}

export class ThinkAsCharacterEffect<
    TPlayer extends IPlayer
> extends ThinkAsEffect<TPlayer, CharacterToken> {
    readonly propertyName = 'character';

    readonly thinkAs: CharacterToken;

    constructor(thinkAs: CharacterToken) {
        super();
        this.thinkAs = thinkAs;
    }
}
