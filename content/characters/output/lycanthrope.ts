import roleData from './lycanthrope.json';
import { Character } from '~/game/character';

export abstract class Lycanthrope extends Character {}

Lycanthrope.initialize(roleData);
