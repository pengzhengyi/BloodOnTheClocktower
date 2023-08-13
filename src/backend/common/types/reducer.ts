export type Reducer<T1, T2> = (previousValue: T1, currentValue: T2) => T1;
export type AsyncReducer<T1, T2> = (
    previousValue: Promise<T1>,
    currentValue: Promise<T2>
) => Promise<T1>;
