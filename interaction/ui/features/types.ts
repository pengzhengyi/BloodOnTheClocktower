export interface IChooseFromOptions<T> {
    options: Iterable<T>;
    recommendation?: T | Iterable<T>;
}

export interface IChosen<T> {
    choices: Array<T>;
}

export interface IDecideFrom<T> {
    context?: unknown;
    recommendation?: T | Iterable<T>;
}

export interface IDecided<T> {
    decided: T;
}
