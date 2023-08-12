import type { EditionId } from './edition-id';

export interface IEditionIdProvider {
    getOfficialEditionIds(): Promise<Set<EditionId>>;

    isOfficialEditionId(id: EditionId): Promise<boolean>;
}
