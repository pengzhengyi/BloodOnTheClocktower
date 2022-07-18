import roleData from './tealady.json';
import { Character } from '~/game/character';

export abstract class Tealady extends Character {}

Tealady.initialize(roleData);
