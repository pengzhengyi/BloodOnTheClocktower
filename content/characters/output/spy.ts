import roleData from './spy.json';
import { Character } from '~/game/character';

export class Spy extends Character {}

Spy.initialize(roleData);
