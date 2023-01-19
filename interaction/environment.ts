import type { IGameUI, IGameUIProvider } from './game-ui';
import { mockEnvironment } from '~/__mocks__/environment';

export interface IEnvironment extends IGameUIProvider {}

export interface IEnvironmentProvider {
    current: IEnvironment;
}

abstract class AbstractEnvironment implements IEnvironment {
    static get current() {
        return mockEnvironment();
    }

    abstract gameUI: IGameUI;
}

export const Environment: IEnvironmentProvider = AbstractEnvironment;
