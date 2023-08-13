export type Factory<V> = () => V;
export type AsyncFactory<V> = () => Promise<V>;
export type AnyFactory<V> = Factory<V> | AsyncFactory<V>;
