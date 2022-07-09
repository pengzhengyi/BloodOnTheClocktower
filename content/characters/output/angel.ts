import roleData from './angel.json';
import { Character } from '~/game/character';

export class Angel extends Character {}

Angel.initialize(roleData);
