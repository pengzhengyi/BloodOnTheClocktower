import type { NoParamConstructor } from '../types/constructor';
import type { ISingleton } from '../types/singleton';

/**
 * Wrap a class to implement the singleton pattern.
 *
 * It achieves so by creating a new class extending the provided class
 * (which must have a parameter-less constructor) and then implement
 * singleton pattern on the new class.
 *
 * Here is a example of how to use this function:
 *
 * ```ts
 * class BaseClass {
 *   constructor() {
 *    ...
 *   }
 * }
 *
 * export const Class = Singleton<BaseClass, typeof BaseClass>(BaseClass);
 * ```
 *
 * @param ClassConstructor The reference to the base class.
 * @returns A new class that extends the base class and implements singleton pattern.
 */
export function Singleton<
    T extends object,
    TClass extends NoParamConstructor<T> = NoParamConstructor<T>
>(ClassConstructor: TClass): ISingleton<T> & Omit<TClass, 'new'> {
    // @ts-ignore: force type conversion with singleton pattern
    return class Singleton extends ClassConstructor {
        static getInstance() {
            if (this._instance === undefined) {
                this._instance = new this() as T;
            }

            return this._instance;
        }

        protected static _instance?: T;

        // eslint-disable-next-line no-useless-constructor
        protected constructor() {
            super();
        }
    };
}
