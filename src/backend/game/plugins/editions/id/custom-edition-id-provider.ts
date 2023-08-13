import type { EditionId } from './edition-id';

export interface ICustomEditionIdProvider {
    createCustomEditionId(customName: string): Promise<EditionId>;

    isCustomEditionId(id: EditionId): Promise<boolean>;
}
