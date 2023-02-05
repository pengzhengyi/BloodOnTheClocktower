import { Edition } from './edition';
import { NoEditionMatchingName } from './exception';
import { NAME_TO_EDITION } from '~/content/editions/editions';

export interface IEditionLoader {
    tryLoad(editionName: string): typeof Edition | undefined;
    loadAsync(editionName: string): Promise<typeof Edition>;
}

export const EditionLoader: IEditionLoader = class EditionLoader {
    static tryLoad(editionName: string): typeof Edition | undefined {
        return NAME_TO_EDITION.get(Edition.getCanonicalName(editionName));
    }

    static async loadAsync(editionName: string): Promise<typeof Edition> {
        const error = new NoEditionMatchingName(editionName);
        await error.throwWhen(
            (error) => this.tryLoad(error.correctedEditionName) === undefined
        );

        return this.tryLoad(error.correctedEditionName)!;
    }
};
