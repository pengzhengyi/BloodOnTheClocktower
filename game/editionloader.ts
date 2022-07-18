import axios, { AxiosRequestConfig } from 'axios';
import { Edition } from './edition';
import { EditionData } from './types';
import { EditionLoadFailure, NoEditionMatchingName } from './exception';
import { NAME_TO_EDITION } from '~/content/editions/editions';

export abstract class EditionLoader {
    static tryLoad(editionName: string): typeof Edition | undefined {
        return NAME_TO_EDITION.get(Edition.getCanonicalName(editionName));
    }

    static async loadAsync(editionName: string): Promise<typeof Edition> {
        const error = new NoEditionMatchingName(editionName);
        await error.throwWhen(
            (error) => this.tryLoad(error.correctedEditionName) === undefined
        );

        return this.tryLoad(error.correctedEditionName)!;
    }

    protected static loadWithEditionData(editionData: Partial<EditionData>) {
        const edition = this.loadEditionClass();
        edition.initialize(editionData);
        return edition;
    }

    protected static loadEditionClass(): typeof Edition {
        return class extends Edition {};
    }

    protected static async loadEditionEditionDataAsync(
        editionName: string
    ): Promise<Partial<EditionData>> {
        const config: AxiosRequestConfig = {};

        return await axios
            .get<Partial<EditionData>>(
                this.getEditionEditionDataApiEndpoint(editionName),
                config
            )
            .catch((error) => {
                throw new EditionLoadFailure(editionName, error);
            })
            .then((response) => response.data);
    }

    protected static getEditionEditionDataApiEndpoint(
        editionName: string
    ): string {
        return `/api/_content/editions/${editionName}`;
    }
}
