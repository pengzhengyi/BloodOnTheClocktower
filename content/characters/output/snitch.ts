import roleData from './snitch.json';
import { Character } from '~/game/character/character';

export abstract class Snitch extends Character {}

Snitch.initialize(roleData);
