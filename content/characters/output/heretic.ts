import roleData from './heretic.json';
import { Character } from '~/game/character/character';

export abstract class Heretic extends Character {}

Heretic.initialize(roleData);
