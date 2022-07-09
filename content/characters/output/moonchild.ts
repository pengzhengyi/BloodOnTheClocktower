import roleData from './moonchild.json';
import { Character } from '~/game/character';

export class Moonchild extends Character {}

Moonchild.initialize(roleData);
