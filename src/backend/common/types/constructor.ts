import type { ExtractAllButFirst, ExtractAllButLast } from './utils';

export type NoParamConstructor<T> = { new (): T };
export type ClassType<T> = { new (...args: any[]): T };
export type StaticThis<T> = ClassType<T>;
export type ConstructorFunction<T, TClass extends ClassType<T>> = (
    ...args: ConstructorParameters<TClass>
) => T;

export type ConstructorFunctionDropFirstParameter<
    T,
    TClass extends ClassType<T>
> = (...args: ExtractAllButFirst<ConstructorParameters<TClass>>) => T;
export type ConstructorFunctionDropLastParameter<
    T,
    TClass extends ClassType<T>
> = (...args: ExtractAllButLast<ConstructorParameters<TClass>>) => T;
