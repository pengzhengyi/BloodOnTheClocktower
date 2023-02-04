import roleData from './engineer.json';
import { Character } from '~/game/character/character';

export abstract class Engineer extends Character {}

Engineer.initialize(roleData);
