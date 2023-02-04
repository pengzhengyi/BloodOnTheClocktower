import { Singleton } from './common';
import { EditionLoader, type IEditionLoader } from './edition-loader';
import type { IEnvironment, IEnvironmentProvider } from './types';

export interface IGameEnvironment extends IEnvironment {
    editionLoader: IEditionLoader;
}

export interface IGameEnvironmentProvider
    extends IEnvironmentProvider<IGameEnvironment> {}

const BaseGameEnvironment: IGameEnvironment = class BaseGameEnvironment {
    static editionLoader: IEditionLoader = EditionLoader;
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
