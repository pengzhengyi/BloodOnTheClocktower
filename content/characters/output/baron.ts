import roleData from './baron.json';
import { Character } from '~/game/character';

export class Baron extends Character {}

Baron.initialize(roleData);
