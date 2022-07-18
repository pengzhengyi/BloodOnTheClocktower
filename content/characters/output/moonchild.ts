import roleData from './moonchild.json';
import { Character } from '~/game/character';

export abstract class Moonchild extends Character {}

Moonchild.initialize(roleData);
