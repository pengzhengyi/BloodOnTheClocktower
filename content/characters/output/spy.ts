import roleData from './spy.json';
import { Character } from '~/game/character/character';

export abstract class Spy extends Character {}

Spy.initialize(roleData);
