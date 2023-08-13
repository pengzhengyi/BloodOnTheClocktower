export type Transform<T1, T2 = T1> = (value: T1) => T2;
export type AsyncTransform<T1, T2 = T1> = (value: T1) => Promise<T2>;
export type AnyTransform<T1, T2 = T1> =
    | Transform<T1, T2>
    | AsyncTransform<T1, T2>;
