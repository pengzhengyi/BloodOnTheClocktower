import type { IGameUI } from '~/interaction/game-ui';
import { dependencyResolver } from '~/inversify.config';
import { SERVICES } from '~/types';

export const GAME_UI = dependencyResolver.get<IGameUI>(SERVICES.GameUI);
