import roleData from './minstrel.json';
import { Character } from '~/game/character';

export class Minstrel extends Character {}

Minstrel.initialize(roleData);
