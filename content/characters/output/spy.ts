import roleData from './spy.json';
import { Character } from '~/game/character';

export abstract class Spy extends Character {}

Spy.initialize(roleData);
