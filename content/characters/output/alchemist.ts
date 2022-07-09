import roleData from './alchemist.json';
import { Character } from '~/game/character';

export class Alchemist extends Character {}

Alchemist.initialize(roleData);
