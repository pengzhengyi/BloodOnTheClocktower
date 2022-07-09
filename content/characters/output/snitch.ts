import roleData from './snitch.json';
import { Character } from '~/game/character';

export class Snitch extends Character {}

Snitch.initialize(roleData);
