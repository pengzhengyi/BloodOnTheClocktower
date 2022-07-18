import roleData from './dreamer.json';
import { Character } from '~/game/character';

export abstract class Dreamer extends Character {}

Dreamer.initialize(roleData);
