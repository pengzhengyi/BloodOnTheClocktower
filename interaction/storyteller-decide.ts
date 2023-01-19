export interface IStorytellerDecide {
    /**
     * Ask storyteller to decide. The required response might be like deciding a night act oder for a character.
     */
    storytellerDecide<T>(
        reason?: string,
        allowNotChoose?: boolean,
        timeout?: number
    ): Promise<T> | Promise<undefined>;
}
