import { fromError, type StackFrame } from 'stacktrace-js';
import type {
    AsyncFactory,
    Predicate,
    StaticThis,
    AsyncPredicate,
    AnyFactory,
    AnyTransform,
} from '../types';

import { InteractionEnvironment } from '~/interaction/environment/environment';

export class BaseError extends Error {
    declare cause?: Error;

    getStackFrames(): Promise<Array<StackFrame>> {
        return fromError(this);
    }

    from(error: Error): this {
        this.cause = error;
        return this;
    }

    aggregate<E extends Error = BaseError>(errors: Iterable<E>): this {
        if (this.cause instanceof AggregateError) {
            this.cause.aggregate(errors);
        } else {
            this.cause = new AggregateError<E>().aggregate(errors);
        }

        return this;
    }

    throw(): never {
        // eslint-disable-next-line no-throw-literal
        throw this;
    }

    throwWhen(condition: Predicate<this>) {
        if (condition(this)) {
            this.throw();
        }
    }
}

export class AggregateError<E extends Error = BaseError> extends Error {
    readonly errors: Array<E> = [];

    get cause(): Error | undefined {
        return this.errors[0];
    }

    aggregate(errors: Iterable<E>) {
        this.errors.push(...errors);
        return this;
    }
}

export class GameError extends BaseError {}

// eslint-disable-next-line no-use-before-define
export type RecoveryAction<TError extends RecoverableGameError, TResult> = (
    error: TError
) => Promise<TResult>;

export class RecoverableGameError extends GameError {
    static async catch<TError extends RecoverableGameError, TResult>(
        this: StaticThis<TError>,
        action: AsyncFactory<TResult>,
        recovery: RecoveryAction<TError, TResult>
    ): Promise<TResult> {
        try {
            return await action();
        } catch (error) {
            if (error instanceof this) {
                await error.resolve();
                return await recovery(error);
            }

            throw error;
        }
    }

    static async ternary<TError extends RecoverableGameError, TResult>(
        this: StaticThis<TError>,
        successWhen: AnyFactory<boolean>,
        successCallback: AnyFactory<TResult>,
        errorFactory: AnyFactory<TError>,
        onErrorResolvedCallback: AnyTransform<TError, TResult>
    ): Promise<TResult> {
        if (await successWhen()) {
            const result = await successCallback();
            return result;
        } else {
            const error = await errorFactory();
            await error.resolve();
            const resultAfterErrorResolved = await onErrorResolvedCallback(
                error
            );
            return resultAfterErrorResolved;
        }
    }

    get handled(): boolean {
        return this.handled_;
    }

    protected handled_ = false;

    async throwWhen(condition: Predicate<this>) {
        if (condition(this)) {
            if (
                await InteractionEnvironment.current.gameUI.storytellerHandle(
                    this
                )
            ) {
                this.handled_ = true;
                if (condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    async throwWhenAsync(condition: AsyncPredicate<this>) {
        if (await condition(this)) {
            if (
                await InteractionEnvironment.current.gameUI.storytellerHandle(
                    this
                )
            ) {
                this.handled_ = true;
                if (await condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    async resolve() {
        if (
            await InteractionEnvironment.current.gameUI.storytellerHandle(this)
        ) {
            this.handled_ = true;
        }
    }
}
