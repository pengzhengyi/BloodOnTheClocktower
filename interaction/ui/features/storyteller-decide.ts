import type { IStorytellerDecideOptions } from './options/interaction-options';
import type { IDecideFrom, IDecided } from './types';

export interface IStorytellerDecide {
    /**
     * Ask storyteller to decide. The required response might be like deciding a night act oder for a character.
     */
    storytellerDecide<T>(
        decideFrom: IDecideFrom<T>,
        options?: IStorytellerDecideOptions
    ): Promise<IDecided<T>>;
}
