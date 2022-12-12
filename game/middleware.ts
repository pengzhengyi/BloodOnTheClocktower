export type NextFunction<TContext> = (context: TContext) => TContext;
export type ApplyFunction<TContext> = (
    context: TContext,
    next: NextFunction<TContext>
) => TContext;

export interface Middleware<TContext> {
    apply: ApplyFunction<TContext>;
}

export class Pipeline<TContext> {
    get middlewares(): Array<Middleware<TContext>> {
        return this.#middlewares;
    }

    #middlewares: Array<Middleware<TContext>>;

    constructor(middlewares: Array<Middleware<TContext>>) {
        this.#middlewares = middlewares;
    }

    apply(initialContext: TContext): TContext {
        return this.applyMiddleware(initialContext, 0);
    }

    protected applyMiddleware(context: TContext, index: number): TContext {
        const middleware = this.middlewares[index];
        if (middleware === undefined) {
            return context;
        }

        return middleware.apply(context, (updatedContext: TContext) =>
            this.applyMiddleware(updatedContext, index + 1)
        );
    }
}
