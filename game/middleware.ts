export type NextFunction<T> = (context: T) => Promise<T>;
export type ApplyFunction<T> = (
    context: T,
    next: NextFunction<T>
) => Promise<T>;

export interface AsyncMiddleware<T> {
    apply: ApplyFunction<T>;
}

export class AsyncPipeline<T> {
    protected get middlewares(): Array<AsyncMiddleware<T>> {
        return this.#middlewares;
    }

    #middlewares: Array<AsyncMiddleware<T>>;

    constructor(middlewares: Array<AsyncMiddleware<T>>) {
        this.#middlewares = middlewares;
    }

    async apply(initialContext: T): Promise<T> {
        return await this.applyMiddleware(initialContext, 0);
    }

    protected async applyMiddleware(context: T, index: number): Promise<T> {
        const middleware = this.middlewares[index];
        if (middleware === undefined) {
            return context;
        }

        return await middleware.apply(context, (updatedContext: T) =>
            this.applyMiddleware(updatedContext, index + 1)
        );
    }
}
