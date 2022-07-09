import roleData from './vigormortis.json';
import { Character } from '~/game/character';

export class Vigormortis extends Character {}

Vigormortis.initialize(roleData);
