export type NextFunction<TContext> = (context: TContext) => TContext;
export type ApplyFunction<TContext> = (
    context: TContext,
    next: NextFunction<TContext>
) => TContext;

export interface IMiddleware<TContext> {
    apply(context: TContext, next: NextFunction<TContext>): TContext;
}
