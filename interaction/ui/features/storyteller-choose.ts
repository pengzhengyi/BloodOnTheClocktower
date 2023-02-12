export interface IStorytellerChoose {
    /**
     * Ask storyteller to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    storytellerChoose<T>(
        options: Iterable<T>,
        n?: number,
        reason?: string,
        allowNotChoose?: boolean,
        recommendation?: T | Iterable<T>,
        timeout?: number
    ): Promise<T> | Promise<T[]> | Promise<undefined>;
}
