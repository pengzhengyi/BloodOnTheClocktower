import { NoEditionMatchingId } from '../exception/no-edition-matching-name';
import type { IEdition } from './edition';
import { Edition } from './edition';
import type { IEditionFromId } from './edition-factory';
import type { EditionId } from './edition-id';

export interface IEditionLoader {
    tryLoad(id: string): IEdition | undefined;
    load(id: string): IEdition;
    loadAsync(id: string): Promise<IEdition>;
}

export class EditionLoader implements IEditionLoader {
    protected readonly editionCache: Map<string, IEdition>;

    constructor(protected readonly editionFactory: IEditionFromId) {
        this.editionCache = new Map();
    }

    tryLoad(id: string): IEdition | undefined {
        const editionId: EditionId = Edition.getCanonicalId(id);
        if (!this.editionCache.has(editionId)) {
            return this.loadNewEdition(editionId);
        }

        return this.editionCache.get(editionId);
    }

    load(id: string): IEdition {
        const edition = this.tryLoad(id);

        if (edition === undefined) {
            throw new NoEditionMatchingId(id);
        }

        return edition;
    }

    async loadAsync(id: string): Promise<IEdition> {
        const editionId: EditionId = Edition.getCanonicalId(id);
        if (!this.editionCache.has(editionId)) {
            return await this.loadNewEditionAsync(editionId);
        }

        return this.editionCache.get(editionId)!;
    }

    protected loadNewEdition(editionId: EditionId): IEdition {
        const edition = this.editionFactory.getEdition(editionId);
        this.addEditionToCache(edition);
        return edition;
    }

    protected async loadNewEditionAsync(
        editionId: EditionId
    ): Promise<IEdition> {
        const edition = await this.editionFactory.getEditionAsync(editionId);
        this.addEditionToCache(edition);
        return edition;
    }

    protected addEditionToCache(edition: IEdition): void {
        this.editionCache.set(edition.id, edition);
    }
}
