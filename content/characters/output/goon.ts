import roleData from './goon.json';
import { Character } from '~/game/character';

export class Goon extends Character {}

Goon.initialize(roleData);
