import type { IEdition } from '../edition';
import type { EditionId } from '../id/edition-id';

export interface IEditionLoader {
    load(editionId: EditionId): Promise<IEdition>;

    save(edition: IEdition): Promise<EditionId>;
}
