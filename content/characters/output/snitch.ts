import roleData from './snitch.json';
import { Character } from '~/game/character';

export abstract class Snitch extends Character {}

Snitch.initialize(roleData);
