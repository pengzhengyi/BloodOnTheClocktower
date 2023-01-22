import { Middleware, NextFunction } from '~/game/middleware';

export class Operation<TContext> implements Middleware<TContext> {
    constructor(
        protected readonly operation: (context: TContext) => TContext,
        protected readonly isBefore: boolean
    ) {
        this.operation = operation;
        this.isBefore = isBefore;
    }

    apply(context: TContext, next: NextFunction<TContext>): TContext {
        if (this.isBefore) {
            const updatedContext = this.operation(context);
            return next(updatedContext);
        } else {
            const updatedContext = next(context);
            return this.operation(updatedContext);
        }
    }
}