import roleData from './goon.json';
import { Character } from '~/game/character';

export abstract class Goon extends Character {}

Goon.initialize(roleData);
