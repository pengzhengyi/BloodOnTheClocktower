import roleData from './goon.json';
import { Character } from '~/game/character/character';

export abstract class Goon extends Character {}

Goon.initialize(roleData);
