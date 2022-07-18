import roleData from './imp.json';
import { Character } from '~/game/character';

export abstract class Imp extends Character {}

Imp.initialize(roleData);
