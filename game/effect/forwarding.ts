import type { GamePhaseKind } from '../game-phase-kind';
import type { NextFunction } from '../proxy/middleware';
import { Effect, type InteractionContext } from './effect';

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

    protected applyCooperativelyImpl(
        context: InteractionContext<TTarget>,
        next: NextFunction<InteractionContext<TTarget>>
    ): InteractionContext<TTarget> {
        // @ts-ignore: allow dynamically invocation of Reflect methods
        context.result = Reflect[context.interaction.trap].apply(null, [
            context.interaction.target,
            ...context.interaction.args,
        ]);

        return next(context);
    }
}
