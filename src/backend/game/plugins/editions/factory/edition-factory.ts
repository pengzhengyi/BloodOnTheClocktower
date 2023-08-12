import type { IEditionDefinition } from '../definition/edition-definition';
import type { IEdition } from '../edition';
import type { EditionId } from '../id/edition-id';

export interface IEditionFactory {
    createCustomEdition(
        customEditionName: string,
        definition: IEditionDefinition
    ): Promise<IEdition>;

    createEdition(
        editionId: EditionId,
        definition: IEditionDefinition
    ): Promise<IEdition>;
}
