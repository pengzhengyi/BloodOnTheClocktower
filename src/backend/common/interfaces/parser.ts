export interface IParser<TInput, TOutput> {
    parse(input: TInput): Promise<TOutput>;
}
