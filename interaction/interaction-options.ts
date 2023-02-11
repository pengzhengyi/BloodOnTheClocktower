export interface IInteractionOptions {
    /**
     * The amount of time in milliseconds to wait for a response before giving up.
     */
    timeout?: number;
    /**
     * A reason for the interaction. Used for debugging and logging purpose.
     */
    reason?: string;
}
