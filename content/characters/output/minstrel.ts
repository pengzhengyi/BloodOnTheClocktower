import roleData from './minstrel.json';
import { Character } from '~/game/character/character';

export abstract class Minstrel extends Character {}

Minstrel.initialize(roleData);
