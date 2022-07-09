import roleData from './mayor.json';
import { Character } from '~/game/character';

export class Mayor extends Character {}

Mayor.initialize(roleData);
