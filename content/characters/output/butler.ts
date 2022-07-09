import roleData from './butler.json';
import { Character } from '~/game/character';

export class Butler extends Character {}

Butler.initialize(roleData);
