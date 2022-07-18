import roleData from './pithag.json';
import { Character } from '~/game/character';

export abstract class Pithag extends Character {}

Pithag.initialize(roleData);
