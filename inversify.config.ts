import '@abraham/reflection';
import { Container } from 'inversify';
import { SERVICES } from './types';
import { GameUI, type IGameUI } from './interaction/game-ui';

const dependencyResolver = new Container();
dependencyResolver.bind<IGameUI>(SERVICES.GameUI).to(GameUI).inSingletonScope();

export { dependencyResolver };
