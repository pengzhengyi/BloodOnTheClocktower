import roleData from './tealady.json';
import { Character } from '~/game/character';

export class Tealady extends Character {}

Tealady.initialize(roleData);
