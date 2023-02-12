import type { IGameUI } from '../ui/game-ui';
import type {
    IInteractionEnvironment,
    IInteractionEnvironmentProvider,
} from './types';
import { mockInteractionEnvironment } from '~/__mocks__/interaction-environment';

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
