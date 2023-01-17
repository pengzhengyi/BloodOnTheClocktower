import type { IGameUI } from '~/interaction/gameui';
import { dependencyResolver } from '~/inversify.config';
import { SERVICES } from '~/types';

export const GAME_UI = dependencyResolver.get<IGameUI>(SERVICES.GameUI);
