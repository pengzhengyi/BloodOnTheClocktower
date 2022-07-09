import roleData from './poppygrower.json';
import { Character } from '~/game/character';

export class Poppygrower extends Character {}

Poppygrower.initialize(roleData);
