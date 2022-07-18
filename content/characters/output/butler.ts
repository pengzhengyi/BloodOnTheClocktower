import roleData from './butler.json';
import { Character } from '~/game/character';

export abstract class Butler extends Character {}

Butler.initialize(roleData);
