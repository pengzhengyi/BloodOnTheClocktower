import roleData from './imp.json';
import { Character } from '~/game/character/character';

export abstract class Imp extends Character {}

Imp.initialize(roleData);
