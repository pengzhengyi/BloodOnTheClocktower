import { AsyncMiddleware, NextFunction } from '~/game/middleware';

export class Operation<T> implements AsyncMiddleware<T> {
    constructor(
        protected readonly operation: (target: T) => T,
        protected readonly isBefore: boolean
    ) {
        this.operation = operation;
        this.isBefore = isBefore;
    }

    async apply(target: T, next: NextFunction<T>): Promise<T> {
        if (this.isBefore) {
            const updatedTarget = this.operation(target);
            return await next(updatedTarget);
        } else {
            const updatedTarget = await next(target);
            return this.operation(updatedTarget);
        }
    }
}
