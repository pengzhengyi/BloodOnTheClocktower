import { BasicGamePhaseKind } from '../game-phase-kind';
import { Predicate } from '../types';
import type { IMiddleware, NextFunction } from '../proxy/middleware';
import type { IPlayer } from '../player';
import { InteractionEnvironment } from '~/interaction/environment';

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

export interface IEffect<TTarget extends object, TGetPriorityContext = any>
    extends IMiddleware<InteractionContext<TTarget>> {
    readonly active: boolean;

    deactivate(reason?: string): Promise<boolean>;

    reactivate(reason?: string): Promise<boolean>;

    /**
     * Determine whether the effect will trigger under a given context
     * @param context The context under which the interaction request might trigger the effect.
     */
    isApplicable(context: InteractionContext<TTarget>): boolean;

    /**
     * Apply current effect's influence on a context. Calling `next` will pass processing to next effect in the processing pipeline. The result of modification is stored inside `context.result`.
     * @param context A context that stores both the information about the triggering interaction and the processed result.
     * @param next A function that represent the remaining effects (lower priority effects) to handle the context.
     * @returns A processed context.
     */
    apply(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget>;

    /**
     * Get the priority of an effect for a given context.
     *
     * For example, priority might differ for first night, during the day, and other nights.
     * @param forWhat The context for which to get priority of.
     * @returns The priority of this effect for given context.
     */
    getPriority(forWhat: TGetPriorityContext): number;

    toString(): string;
}

/**
 * Effect is the influence resulting from player's character ability. Effect can impact either the state of the game or players.
 */
export abstract class Effect<TTarget extends object>
    implements IEffect<TTarget, BasicGamePhaseKind>
{
    protected _active = true;

    get active(): boolean {
        return this._active;
    }

    async deactivate(reason?: string): Promise<boolean> {
        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
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
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                this.formatReactivatePrompt(reason)
            )
        ) {
            this._active = true;
            return true;
        }

        return false;
    }

    /**
     * Get the priority of an effect for a given game phase.
     *
     * For example, priority might differ for first night, during the day, and other nights.
     * @param gamePhaseKind A category of game phase.
     * @returns The priority of this effect in current game phase.
     */
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
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        return this.applyCooperatively(context, next);
    }

    toString(): string {
        return this.constructor.name;
    }

    protected applyCooperatively(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        if (context.result === undefined) {
            return this.applyCooperativelyImpl(context, next);
        } else {
            return next(context);
        }
    }

    protected applyCooperativelyImpl(
        _context: InteractionContext<TTarget>,
        _next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        throw new Error('Method not implemented.');
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
