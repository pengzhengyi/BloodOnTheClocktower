export type NoParamConstructor<T> = { new (): T };
export type Constructor<T> = { new (...args: any[]): T };
export type StaticThis<T> = Constructor<T>;
