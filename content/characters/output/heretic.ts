import roleData from './heretic.json';
import { Character } from '~/game/character';

export abstract class Heretic extends Character {}

Heretic.initialize(roleData);
