import roleData from './engineer.json';
import { Character } from '~/game/character';

export class Engineer extends Character {}

Engineer.initialize(roleData);
