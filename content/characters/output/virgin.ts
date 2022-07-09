import roleData from './virgin.json';
import { Character } from '~/game/character';

export class Virgin extends Character {}

Virgin.initialize(roleData);
