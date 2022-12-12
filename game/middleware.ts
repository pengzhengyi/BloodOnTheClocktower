export type NextFunction<TContext> = (context: TContext) => TContext;
export type ApplyFunction<TContext> = (
    context: TContext,
    next: NextFunction<TContext>
) => TContext;

export interface Middleware<TContext> {
    apply: ApplyFunction<TContext>;
}

export class Pipeline<
    TContext,
    TMiddleware extends Middleware<TContext> = Middleware<TContext>
> {
    #middlewares: Array<TMiddleware>;

    constructor(middlewares: Array<TMiddleware>) {
        this.#middlewares = middlewares;
    }

    apply(initialContext: TContext): TContext {
        const middlewares = this.getApplicableMiddlewares(initialContext);
        return this.applyMiddleware(initialContext, middlewares, 0);
    }

    protected getApplicableMiddlewares(_context: TContext): Array<TMiddleware> {
        return this.#middlewares;
    }

    protected applyMiddleware(
        context: TContext,
        middlewares: Array<TMiddleware>,
        index: number
    ): TContext {
        const middleware = middlewares[index];
        if (middleware === undefined) {
            return context;
        }

        return middleware.apply(context, (updatedContext: TContext) =>
            this.applyMiddleware(updatedContext, middlewares, index + 1)
        );
    }
}
