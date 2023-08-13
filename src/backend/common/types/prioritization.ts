export interface Allocation<T> {
    key: T;
    desiredNumber?: number;
    isStrictUpperbound?: boolean;
}

export type Prioritization<T> = Iterable<Allocation<T>>;
