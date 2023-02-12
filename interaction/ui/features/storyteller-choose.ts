import type { IStorytellerChooseOptions } from './options/interaction-options';

import type { IChooseFromOptions, IChosen } from './types';

export interface IStorytellerChoose {
    /**
     * Ask storyteller to choose from some options.
     *
     * It can be specified either as single select (default) or multi-select.
     */
    storytellerChoose<T>(
        chooseFrom: IChooseFromOptions<T>,
        options?: IStorytellerChooseOptions
    ): Promise<IChosen<T>>;
}
