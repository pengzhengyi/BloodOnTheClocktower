import path from 'path';
import fs, { promises as afs } from 'fs';
import type { RoleData } from '../types';
import type { CharacterId } from './character-id';

export interface ICharacterDefinitionProvider {
    getCharacterDefinition(id: CharacterId): Partial<RoleData>;
}

export interface IAsyncCharacterDefinitionProvider {
    getCharacterDefinitionAsync(id: CharacterId): Promise<Partial<RoleData>>;
}

export class FileReaderBasedProvider
    implements ICharacterDefinitionProvider, IAsyncCharacterDefinitionProvider
{
    // eslint-disable-next-line no-useless-constructor
    constructor(protected readonly characterDefinitionFolderPath: string) {}

    getCharacterDefinition(id: CharacterId): Partial<RoleData> {
        const filepath = this.getFilePath(id);
        const characterDefinitionString =
            this.readCharacterDefinition(filepath);
        const characterDefinition = JSON.parse(characterDefinitionString);
        return characterDefinition;
    }

    async getCharacterDefinitionAsync(
        id: CharacterId
    ): Promise<Partial<RoleData>> {
        const filepath = this.getFilePath(id);
        const characterDefinitionString =
            await this.readCharacterDefinitionAsync(filepath);
        const characterDefinition = JSON.parse(characterDefinitionString);
        return characterDefinition;
    }

    protected getFilePath(id: CharacterId) {
        const filepath = path.join(
            this.characterDefinitionFolderPath,
            `${id}.json`
        );
        return filepath;
    }

    protected readCharacterDefinition(filepath: string) {
        return fs.readFileSync(filepath, 'utf-8');
    }

    protected readCharacterDefinitionAsync(filepath: string): Promise<string> {
        return afs.readFile(filepath, 'utf-8');
    }
}
