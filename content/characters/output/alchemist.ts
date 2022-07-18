import roleData from './alchemist.json';
import { Character } from '~/game/character';

export abstract class Alchemist extends Character {}

Alchemist.initialize(roleData);
