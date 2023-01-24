import type { DeadReason } from '../dead-reason';
import type { NextFunction } from '../proxy/middleware';
import { Effect, InteractionContext } from './effect';

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
