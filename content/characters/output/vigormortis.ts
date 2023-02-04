import roleData from './vigormortis.json';
import { Character } from '~/game/character/character';

export abstract class Vigormortis extends Character {}

Vigormortis.initialize(roleData);
