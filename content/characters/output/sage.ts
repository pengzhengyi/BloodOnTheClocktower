import roleData from './sage.json';
import { Character } from '~/game/character';

export class Sage extends Character {}

Sage.initialize(roleData);
