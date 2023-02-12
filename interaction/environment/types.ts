import type { IGameUI } from '../ui/game-ui';
import type { IEnvironment, IEnvironmentProvider } from '~/game/types';

export interface IInteractionEnvironment extends IEnvironment {
    gameUI: IGameUI;
}

export interface IInteractionEnvironmentProvider
    extends IEnvironmentProvider<IInteractionEnvironment> {}
