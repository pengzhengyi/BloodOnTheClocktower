import type { IMiddleware } from './middleware';

/**
 * IPipeline represents the transformation process of a context.
 *
 * It is named as pipeline as its implementation usually relies on middlewares to do the transformation. The context is typically handed over to first middleware to process, then to the second, and so on...
 */
export interface IPipeline<TContext> {
    /**
     * Apply transformation to the context. The operation is synchronous.
     *
     * ! There is no guarantee whether the initial context will or will not be modified and whether the returned context is same or different reference to the initial context. It depends on implementation details.
     *
     * @param initialContext The initial context before any transformation.
     * @return The transformed context.
     */
    apply(initialContext: TContext): TContext;
}

export class Pipeline<
    TContext,
    TMiddleware extends IMiddleware<TContext> = IMiddleware<TContext>
> implements IPipeline<TContext>
{
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
