export type TJSON =
    | string
    | number
    | boolean
    | null
    | TJSON[]
    | { [key: string]: TJSON };
