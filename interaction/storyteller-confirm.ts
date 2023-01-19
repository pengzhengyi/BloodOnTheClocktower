export interface IStorytellerConfirm {
    /**
     * Ask storyteller for confirmation.
     */
    storytellerConfirm(prompt: string, timeout?: number): Promise<boolean>;
}
