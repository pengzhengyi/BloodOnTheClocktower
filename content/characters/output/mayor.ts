import roleData from './mayor.json';
import { Character } from '~/game/character';

export abstract class Mayor extends Character {}

Mayor.initialize(roleData);
