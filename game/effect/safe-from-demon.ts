import type { DeadReason } from '../dead-reason';
import type { NextFunction } from '../proxy/middleware';
import { Effect, InteractionContext } from './effect';

export abstract class SafeFromDemonEffect<
    TPlayer extends object
> extends Effect<TPlayer> {
    isApplicable(context: InteractionContext<TPlayer>): boolean {
        return super.isApplicable(context) && this.matchDemonKill(context);
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<TPlayer>,
        next: NextFunction<InteractionContext<TPlayer>>
    ): InteractionContext<TPlayer> {
        context.result = (_reason: DeadReason) => Promise.resolve(undefined);
        const updatedContext = next(context);
        return updatedContext;
    }
}
