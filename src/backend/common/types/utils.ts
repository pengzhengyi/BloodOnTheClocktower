export type ExtractAllButFirst<T extends unknown[]> = T extends [
    infer _,
    ...infer Tail
]
    ? Tail
    : never;
export type ExtractAllButLast<T extends unknown[]> = T extends [
    ...infer Head,
    infer _
]
    ? Head
    : never;
