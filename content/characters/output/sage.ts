import roleData from './sage.json';
import { Character } from '~/game/character';

export abstract class Sage extends Character {}

Sage.initialize(roleData);
