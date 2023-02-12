import type { IStorytellerChooseOneOptions } from './options/interaction-options';
import type { IChooseFromOptions } from './types';

export interface IStorytellerChooseOne {
    /**
     * Ask storyteller to choose one from some options.
     */
    storytellerChooseOne<T>(
        chooseFrom: IChooseFromOptions<T>,
        options?: IStorytellerChooseOneOptions
    ): Promise<T>;
}
