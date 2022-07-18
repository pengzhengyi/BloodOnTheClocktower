import roleData from './angel.json';
import { Character } from '~/game/character';

export abstract class Angel extends Character {}

Angel.initialize(roleData);
