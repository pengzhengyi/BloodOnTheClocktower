export type Predicate<T> = (value: T) => boolean;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type AnyPredicate<T> = Predicate<T> | AsyncPredicate<T>;
export const TAUTOLOGY = () => true;
