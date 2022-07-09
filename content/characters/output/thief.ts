import roleData from './thief.json';
import { Character } from '~/game/character';

export class Thief extends Character {}

Thief.initialize(roleData);
