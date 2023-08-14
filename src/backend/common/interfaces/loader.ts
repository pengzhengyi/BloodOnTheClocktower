export interface ILoader<K, V> {
    load(input: K): Promise<V>;

    save(output: V): Promise<K>;
}
