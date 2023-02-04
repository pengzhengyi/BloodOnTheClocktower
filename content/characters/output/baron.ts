import roleData from './baron.json';
import { Character } from '~/game/character/character';

export abstract class Baron extends Character {}

Baron.initialize(roleData);
