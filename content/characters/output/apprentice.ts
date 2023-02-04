import roleData from './apprentice.json';
import { Character } from '~/game/character/character';

export abstract class Apprentice extends Character {}

Apprentice.initialize(roleData);
