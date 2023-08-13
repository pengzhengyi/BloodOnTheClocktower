import { fromError, type StackFrame } from 'stacktrace-js';
import type { AsyncPredicate, Predicate } from '../types/predicate';
import type { AnyTransform } from '../types/transform';
import type { StaticThis } from '../types/constructor';
import type { AsyncFactory, AnyFactory } from '../types/factory';

/**
 * Base class for all exceptions.
 *
 * Exception refers to user-defined errors and it includes additional information about the error like cause and stackframe.
 */
export class Exception extends Error {
    declare cause?: Error;

    /**
     * Get stackframes of this exception.
     */
    getStackFrames(): Promise<Array<StackFrame>> {
        return fromError(this);
    }

    /**
     * Associate another error as the cause of this exception.
     *
     * @param error The error which is the cause of this exception.
     * @returns This exception.
     */
    from(error: Error): this {
        this.cause = error;
        return this;
    }

    /**
     * @throws This exception.
     */
    throw(): never {
        // eslint-disable-next-line no-throw-literal
        throw this;
    }

    /**
     * Throw this exception when the condition is true.
     */
    remediate(condition: Predicate<this>) {
        if (condition(this)) {
            this.throw();
        }
    }
}

export class AggregateException<E extends Error = Exception> extends Error {
    readonly errors: Array<E> = [];

    aggregate(errors: Iterable<E>) {
        this.errors.push(...errors);
        return this;
    }
}

export abstract class RecoverableException extends Exception {
    /**
     * Execute the specified action and catch this type of exception. When this exception is caught, try to resolve it and execute the specified callback when successfully resolved the exception. If this exception is not this type of exception or failed to resolve, rethrow the exception.
     *
     * @param this The type of exception to catch.
     * @param action An asynchronous action to execute.
     * @param onErrorResolvedCallback A callback to execute when this exception is successfully resolved. It will receive an instance of resolved exception and should return the result or a promise of the result.
     * @returns The result of executing the specified action or the result of executing the specified error callback when this exception is successfully resolved.
     * @throws The exception when it is not this type of exception or failed to resolve.
     */
    static async catch<TError extends RecoverableException, TResult>(
        this: StaticThis<TError>,
        action: AsyncFactory<TResult>,
        onErrorResolvedCallback: AnyTransform<TError, TResult>
    ): Promise<TResult> {
        try {
            return await action();
        } catch (error) {
            if (error instanceof this) {
                if (await error.resolve()) {
                    return await onErrorResolvedCallback(error);
                }
            }

            throw error;
        }
    }

    /**
     *Execute the specified action and catch this type of exception. When this exception is caught, try to resolve it and execute the specified callback when successfully resolved the exception. If this exception is not this type of exception or failed to resolve, rethrow the exception.
     *
     * Similar to a ternary expression, this method will execute the specified success callback when the specified condition is satisfied. Otherwise, it will execute the specified error factory to create an instance of this exception and try to resolve it. If this exception is successfully resolved, it will execute the specified error callback that will receive the resolved exception and should produce either the result or a promise to the result. Otherwise, it will throw the exception.
     *
     * @param this The type of exception to catch.
     * @param successWhen The condition to check.
     * @param successCallback The callback to execute when the condition is satisfied.
     * @param errorFactory The factory to create an instance of this exception.
     * @param onErrorResolvedCallback The callback to execute when this exception is successfully resolved.
     * @returns The result of executing the specified success callback when the condition is satisfied or the result of executing the specified error callback when this exception is successfully resolved.
     * @throws The exception produced by the specified error factory when the condition is not satisfied and failed to resolve the produced exception.
     */
    static async ternary<TError extends RecoverableException, TResult>(
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
            if (await error.resolve()) {
                const resultAfterErrorResolved = await onErrorResolvedCallback(
                    error
                );
                return resultAfterErrorResolved;
            }

            throw error;
        }
    }

    get handled(): boolean {
        return this.handled_;
    }

    protected handled_ = false;

    /**
     * Check whether specified condition is satisfied. When not satisfied, try to remediate by resolving this exception and checking again. If the condition is still not satisfied or remediation failed, throw this exception.
     *
     * @param condition The condition to check.
     * @throws This exception when the condition is not satisfied or remediation failed.
     */
    async remediate(condition: Predicate<this>) {
        if (condition(this)) {
            if (await this.resolve()) {
                if (condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    /**
     * Check whether specified asynchronous condition is satisfied. When not satisfied, try to remediate by resolving this exception and checking again. If the condition is still not satisfied or remediation failed, throw this exception.
     *
     * @param condition The asynchronous condition to check.
     * @throws This exception when the condition is not satisfied or remediation failed.
     */
    async remediateAsync(condition: AsyncPredicate<this>) {
        if (await condition(this)) {
            if (await this.resolve()) {
                if (await condition(this)) {
                    this.throw();
                }
            } else {
                this.throw();
            }
        }
    }

    /**
     * Resolve this exception by attempting to handle it.
     *
     * When this exception is already handled, it will return true immediately.
     *
     * @returns Whether this exception is successfully handled.
     */
    async resolve(): Promise<boolean> {
        if (this.handled_) {
            return true;
        }

        if (await this.handle()) {
            this.handled_ = true;
            return true;
        }

        return false;
    }

    /**
     * Handle this exception.
     *
     * It is internally called when trying to handle this exception. Derived
     * classes should override this method to provide their own handling logic.
     *
     * @returns Whether this exception is successfully handled.
     */
    protected abstract handle(): Promise<boolean>;
}
