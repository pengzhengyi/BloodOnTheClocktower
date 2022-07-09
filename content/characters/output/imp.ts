import roleData from './imp.json';
import { Character } from '~/game/character';

export class Imp extends Character {}

Imp.initialize(roleData);
