import type { EditionId } from './edition-id';

export interface IOfficialEditionIdProvider {
    getOfficialEditionIds(): Promise<Set<EditionId>>;

    isOfficialEditionId(id: EditionId): Promise<boolean>;
}
