import roleData from './klutz.json';
import { Character } from '~/game/character';

export abstract class Klutz extends Character {}

Klutz.initialize(roleData);
