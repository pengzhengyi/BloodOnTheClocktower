import roleData from './lycanthrope.json';
import { Character } from '~/game/character/character';

export abstract class Lycanthrope extends Character {}

Lycanthrope.initialize(roleData);
