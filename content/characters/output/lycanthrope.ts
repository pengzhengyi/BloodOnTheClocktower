import roleData from './lycanthrope.json';
import { Character } from '~/game/character';

export class Lycanthrope extends Character {}

Lycanthrope.initialize(roleData);
