import roleData from './dreamer.json';
import { Character } from '~/game/character';

export class Dreamer extends Character {}

Dreamer.initialize(roleData);
