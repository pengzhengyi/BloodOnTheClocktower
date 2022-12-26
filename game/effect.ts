import type { Middleware, NextFunction } from './middleware';
import { GAME_UI } from '~/interaction/gameui';

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
    extends Middleware<InteractionContext<TTarget>> {
    /**
     * Determine whether the effect will trigger under a given context
     * @param context The context under which the interaction request might trigger the effect.
     */
    isApplicable(context: InteractionContext<TTarget>): boolean;
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
            await GAME_UI.storytellerConfirm(
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
            await GAME_UI.storytellerConfirm(
                this.formatReactivatePrompt(reason)
            )
        ) {
            this._active = true;
            return true;
        }

        return false;
    }

    isApplicable(_context: InteractionContext<TTarget>): boolean {
        return this.active;
    }

    abstract apply(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget>;

    toString(): string {
        return this.constructor.name;
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

    apply(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        if (context.result === undefined) {
            // @ts-ignore: allow dynamically invocation of Reflect methods
            context.result = Reflect[context.interaction.trap](
                context.interaction.target,
                ...context.interaction.args
            );
        }

        return next(context);
    }
}
