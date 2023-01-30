import type { IGameUI, IGameUIProvider } from './game-ui';
import { mockInteractionEnvironment } from '~/__mocks__/interaction-environment';

export interface IInteractionEnvironment extends IGameUIProvider {}

export interface IInteractionEnvironmentProvider {
    current: IInteractionEnvironment;
}

abstract class AbstractInteractionEnvironment
    implements IInteractionEnvironment
{
    protected static _current = mockInteractionEnvironment();

    static get current() {
        return this._current;
    }

    abstract gameUI: IGameUI;
}

export const InteractionEnvironment: IInteractionEnvironmentProvider =
    AbstractInteractionEnvironment;
