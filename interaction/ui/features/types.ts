export interface IChooseFromOptions<T> {
    options: Iterable<T>;
    recommendation?: T | Iterable<T>;
}

export interface IChosen<T> {
    choices: Array<T>;
}
