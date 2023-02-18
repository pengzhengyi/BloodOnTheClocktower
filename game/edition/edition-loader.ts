import { NoEditionMatchingName } from '../exception/no-edition-matching-name';
import type { Edition } from './edition';
import { NAME_TO_EDITION } from '~/content/editions/editions';

export interface IEditionLoader {
    tryLoad(editionName: string): typeof Edition | undefined;
    loadAsync(editionName: string): Promise<typeof Edition>;
}

export const EditionLoader: IEditionLoader = class EditionLoader {
    static tryLoad(editionName: string): typeof Edition | undefined {
        return NAME_TO_EDITION[editionName];
    }

    static async loadAsync(editionName: string): Promise<typeof Edition> {
        const error = new NoEditionMatchingName(editionName);
        await error.throwWhen(
            (error) => this.tryLoad(error.correctedEditionName) === undefined
        );

        return this.tryLoad(error.correctedEditionName)!;
    }
};
