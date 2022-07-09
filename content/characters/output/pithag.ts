import roleData from './pithag.json';
import { Character } from '~/game/character';

export class Pithag extends Character {}

Pithag.initialize(roleData);
