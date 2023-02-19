import path from 'path';
import type { RoleData } from '../types';
import type { CharacterId } from './character-id';
import type { ILocalFileReader } from '~/utils/common';
import { LocalJSONReader } from '~/utils/common';

export interface ICharacterDefinitionProvider {
    getCharacterDefinition(id: CharacterId): Partial<RoleData>;
}

export interface IAsyncCharacterDefinitionProvider {
    getCharacterDefinitionAsync(id: CharacterId): Promise<Partial<RoleData>>;
}

export class FileReaderBasedProvider
    implements ICharacterDefinitionProvider, IAsyncCharacterDefinitionProvider
{
    protected readonly fileReader: ILocalFileReader<Partial<RoleData>>;

    constructor(protected readonly characterDefinitionFolderPath: string) {
        this.fileReader = new LocalJSONReader<Partial<RoleData>>();
    }

    getCharacterDefinition(id: CharacterId): Partial<RoleData> {
        const filepath = this.getFilePath(id);
        const characterDefinition = this.fileReader.read(filepath);
        return characterDefinition;
    }

    async getCharacterDefinitionAsync(
        id: CharacterId
    ): Promise<Partial<RoleData>> {
        const filepath = this.getFilePath(id);
        const characterDefinition = await this.fileReader.readAsync(filepath);
        return characterDefinition;
    }

    protected getFilePath(id: CharacterId) {
        const filepath = path.join(
            this.characterDefinitionFolderPath,
            `${id}.json`
        );
        return filepath;
    }
}
