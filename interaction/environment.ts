import type { IGameUI } from './game-ui';
import { mockInteractionEnvironment } from '~/__mocks__/interaction-environment';
import type { IEnvironment, IEnvironmentProvider } from '~/game/types';

export interface IInteractionEnvironment extends IEnvironment {
    gameUI: IGameUI;
}

export interface IInteractionEnvironmentProvider
    extends IEnvironmentProvider<IInteractionEnvironment> {}

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
