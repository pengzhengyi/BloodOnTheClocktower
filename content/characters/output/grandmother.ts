import roleData from './grandmother.json';
import { Character } from '~/game/character';

export class Grandmother extends Character {}

Grandmother.initialize(roleData);
