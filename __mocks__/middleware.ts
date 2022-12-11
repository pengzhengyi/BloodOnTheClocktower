import { AsyncMiddleware, NextFunction } from '~/game/middleware';

export class Operation<T> implements AsyncMiddleware<T> {
    constructor(
        protected readonly operation: (context: T) => T,
        protected readonly isBefore: boolean
    ) {
        this.operation = operation;
        this.isBefore = isBefore;
    }

    async apply(context: T, next: NextFunction<T>): Promise<T> {
        if (this.isBefore) {
            const updatedContext = this.operation(context);
            return await next(updatedContext);
        } else {
            const updatedContext = await next(context);
            return this.operation(updatedContext);
        }
    }
}
