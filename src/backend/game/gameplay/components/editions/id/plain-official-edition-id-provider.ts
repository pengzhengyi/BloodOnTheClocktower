import type { IOfficialEditionIdProvider } from './official-edition-id-provider';

export enum EDITIONS {
    TroubleBrewing = 'troublebrewing',
    SectsViolets = 'sectsviolets',
    BadMoonRising = 'badmoonrising',
    ExperimentalCharacters = 'experimentalcharacters',
}

export abstract class PlainOfficialEditionIdProvider
    implements IOfficialEditionIdProvider
{
    getOfficialEditionIds(): Promise<Set<string>> {
        const editionIds = new Set<string>(Object.values(EDITIONS));

        return Promise.resolve(editionIds);
    }

    async isOfficialEditionId(id: string): Promise<boolean> {
        const editionIds: Set<string> = await this.getOfficialEditionIds();

        return editionIds.has(id);
    }
}
