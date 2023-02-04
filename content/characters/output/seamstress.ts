import roleData from './seamstress.json';
import { Character } from '~/game/character/character';

export abstract class Seamstress extends Character {}

Seamstress.initialize(roleData);
