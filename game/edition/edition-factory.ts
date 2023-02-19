import type { EditionData } from '../types';
import type { IEdition } from './edition';
import { Edition } from './edition';
import type {
    IEditionDefinitionProvider,
    IAsyncEditionDefinitionProvider,
} from './edition-definition-provider';
import type { EditionId } from './edition-id';

export interface IEditionFromDefinition {
    getEdition(definition: Partial<EditionData>): IEdition;
}

export class EditionFromDefinition implements IEditionFromDefinition {
    getEdition(definition: Partial<EditionData>): IEdition {
        const EditionClass = class extends Edition {
            // eslint-disable-next-line no-useless-constructor
            constructor(definition: Partial<EditionData>) {
                super(definition);
            }
        };

        const edition = new EditionClass(definition);
        return edition;
    }
}

export interface IEditionFromId {
    getEdition(id: EditionId): IEdition;

    getEditionAsync(id: EditionId): Promise<IEdition>;
}

abstract class AbstractEditionFromId implements IEditionFromId {
    protected readonly editionFromDefinition: IEditionFromDefinition;

    constructor(editionFromDefinition: IEditionFromDefinition) {
        this.editionFromDefinition = editionFromDefinition;
    }

    getEdition(id: EditionId): IEdition {
        const definition = this.getEditionDefinition(id);
        const edition = this.editionFromDefinition.getEdition(definition);
        return edition;
    }

    async getEditionAsync(id: EditionId): Promise<IEdition> {
        const definition = await this.getEditionDefinitionAsync(id);
        const edition = this.editionFromDefinition.getEdition(definition);
        return edition;
    }

    protected abstract getEditionDefinition(
        id: EditionId
    ): Partial<EditionData>;

    protected abstract getEditionDefinitionAsync(
        id: EditionId
    ): Promise<Partial<EditionData>>;
}

export class EditionFromId extends AbstractEditionFromId {
    protected editionDefinitionProvider: IEditionDefinitionProvider &
        IAsyncEditionDefinitionProvider;

    constructor(
        editionFromDefinition: IEditionFromDefinition,
        editionDefinitionProvider: IEditionDefinitionProvider &
            IAsyncEditionDefinitionProvider
    ) {
        super(editionFromDefinition);
        this.editionDefinitionProvider = editionDefinitionProvider;
    }

    protected getEditionDefinition(id: EditionId): Partial<EditionData> {
        const definition =
            this.editionDefinitionProvider.getEditionDefinition(id);
        return definition;
    }

    protected async getEditionDefinitionAsync(
        id: EditionId
    ): Promise<Partial<EditionData>> {
        const definition =
            await this.editionDefinitionProvider.getEditionDefinitionAsync(id);
        return definition;
    }
}
