export type NextFunction<T> = (target: T) => Promise<T>;
export type ApplyFunction<T> = (target: T, next: NextFunction<T>) => Promise<T>;

export interface AsyncMiddleware<T> {
    apply: ApplyFunction<T>;
}

export class AsyncPipeline<T> {
    constructor(readonly middlewares: Array<AsyncMiddleware<T>>) {
        this.middlewares = middlewares;
    }

    async apply(initialTarget: T): Promise<T> {
        return await this.applyMiddleware(initialTarget, 0);
    }

    protected async applyMiddleware(target: T, index: number): Promise<T> {
        const middleware = this.middlewares[index];
        if (middleware === undefined) {
            return target;
        }

        return await middleware.apply(target, (updatedTarget: T) =>
            this.applyMiddleware(updatedTarget, index + 1)
        );
    }
}
