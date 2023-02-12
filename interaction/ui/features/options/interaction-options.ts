import type { ISerializationOptions } from '~/serialization/types';

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

export interface IStorytellerConfirmOptions extends IInteractionOptions {}

export interface ICallForNominationOptions
    extends IInteractionOptions,
        Partial<ISerializationOptions> {}
