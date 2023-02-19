import path from 'path';
import type { EditionData } from '../types';
import type { EditionId } from './edition-id';
import type { ILocalFileReader } from '~/utils/common';
import { LocalJSONReader } from '~/utils/common';

export interface IEditionDefinitionProvider {
    getEditionDefinition(id: EditionId): Partial<EditionData>;
}

export interface IAsyncEditionDefinitionProvider {
    getEditionDefinitionAsync(id: EditionId): Promise<Partial<EditionData>>;
}

export class FileReaderBasedProvider
    implements IEditionDefinitionProvider, IAsyncEditionDefinitionProvider
{
    protected readonly fileReader: ILocalFileReader<Partial<EditionData>>;

    constructor(protected readonly editionDefinitionFolderPath: string) {
        this.fileReader = new LocalJSONReader<Partial<EditionData>>();
    }

    getEditionDefinition(id: EditionId): Partial<EditionData> {
        const filepath = this.getFilePath(id);
        const editionDefinition = this.fileReader.read(filepath);
        return editionDefinition;
    }

    async getEditionDefinitionAsync(
        id: EditionId
    ): Promise<Partial<EditionData>> {
        const filepath = this.getFilePath(id);
        const editionDefinition = await this.fileReader.readAsync(filepath);
        return editionDefinition;
    }

    protected getFilePath(id: EditionId) {
        const filepath = path.join(
            this.editionDefinitionFolderPath,
            `${id}.json`
        );
        return filepath;
    }
}
