export type ResolveCallback<T> = (value: T | PromiseLike<T>) => void;
export type RejectCallback = (reason?: unknown) => void;
