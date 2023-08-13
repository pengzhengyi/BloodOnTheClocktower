import type { IEditionDefinition } from '../definition/edition-definition';
import type { IEdition } from '../edition';
import { EditionFromDefinition } from './edition-from-definition';
import type { ICustomEditionIdProvider } from '../id/custom-edition-id-provider';
import type { IEditionFactory } from './edition-factory';

export class PlainEditionFactory implements IEditionFactory {
    protected customEditionIdProvider: ICustomEditionIdProvider;

    constructor(customEditionIdProvider: ICustomEditionIdProvider) {
        this.customEditionIdProvider = customEditionIdProvider;
    }

    async createCustomEdition(
        customEditionName: string,
        definition: IEditionDefinition
    ): Promise<IEdition> {
        const editionId =
            await this.customEditionIdProvider.createCustomEditionId(
                customEditionName
            );
        const edition = await this.createEdition(editionId, definition);
        return edition;
    }

    createEdition(
        editionId: string,
        definition: IEditionDefinition
    ): Promise<IEdition> {
        const edition = new EditionFromDefinition(editionId, definition);
        return Promise.resolve(edition);
    }
}
