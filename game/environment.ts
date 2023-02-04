import { Generator } from './collections';
import { Singleton } from './common';
import type { IGameConfiguration } from './configuration/configuration';
import { DefaultStaticGameConfiguration } from './configuration/configuration';
import type { Edition } from './edition';
import { EditionLoader, type IEditionLoader } from './edition-loader';
import type { IEnvironment, IEnvironmentProvider } from './types';

export interface IGameEnvironment extends IEnvironment {
    editionLoader: IEditionLoader;
    configuration: IGameConfiguration;

    // utility methods
    getSupportedEditions(): Promise<Array<typeof Edition>>;
}

export interface IGameEnvironmentProvider
    extends IEnvironmentProvider<IGameEnvironment> {}

const BaseGameEnvironment: IGameEnvironment = class BaseGameEnvironment {
    static editionLoader: IEditionLoader = EditionLoader;
    static configuration: IGameConfiguration = DefaultStaticGameConfiguration;

    protected static supportedEditions?: Array<typeof Edition>;

    static async getSupportedEditions(): Promise<Array<typeof Edition>> {
        if (this.supportedEditions === undefined) {
            const supportedEditionNames: Array<string> =
                this.configuration.supportedEditions;
            const supportedEditions = await Generator.promiseAll(
                Generator.toPromise(
                    (editionName) => this.editionLoader.loadAsync(editionName),
                    supportedEditionNames
                )
            );

            this.supportedEditions = supportedEditions;
        }

        return this.supportedEditions;
    }
};

class BaseGameEnvironmentProvider implements IGameEnvironmentProvider {
    get current(): IGameEnvironment {
        return BaseGameEnvironment;
    }
}
const GameEnvironmentProvider = Singleton<BaseGameEnvironmentProvider>(
    BaseGameEnvironmentProvider
);

export const GameEnvironment: IGameEnvironmentProvider =
    GameEnvironmentProvider.getInstance();
