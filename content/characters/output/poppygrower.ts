import roleData from './poppygrower.json';
import { Character } from '~/game/character';

export abstract class Poppygrower extends Character {}

Poppygrower.initialize(roleData);
