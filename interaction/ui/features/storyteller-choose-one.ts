export interface IStorytellerChooseOne {
    /**
     * Ask storyteller to choose one from some options.
     */
    storytellerChooseOne<T>(
        options: Iterable<T>,
        reason?: string,
        recommendation?: T,
        timeout?: number
    ): Promise<T>;
}
