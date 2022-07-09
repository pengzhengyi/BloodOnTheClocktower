import roleData from './klutz.json';
import { Character } from '~/game/character';

export class Klutz extends Character {}

Klutz.initialize(roleData);
