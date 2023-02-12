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

export interface ICallForNominationOptions
    extends IInteractionOptions,
        Partial<ISerializationOptions> {
    /**
     * If true, only the first proposed nomination will be returned.
     */
    firstOnly?: boolean;

    /**
     * The amount of time in milliseconds to wait after first proposed nomination for other "concurrently" proposed nominations. Grace period is used to allow storyteller to choose among nominations at "roughly the same" time.
     */
    gracePeriod?: number;
}

export interface IChooseOptions
    extends IInteractionOptions,
        Partial<ISerializationOptions> {
    numToChoose?: number;
}

export interface IStorytellerConfirmOptions extends IInteractionOptions {}
