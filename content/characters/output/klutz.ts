import roleData from './klutz.json';
import { Character } from '~/game/character/character';

export abstract class Klutz extends Character {}

Klutz.initialize(roleData);
