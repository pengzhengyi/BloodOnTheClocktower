import roleData from './poppygrower.json';
import { Character } from '~/game/character/character';

export abstract class PoppyGrower extends Character {}

PoppyGrower.initialize(roleData);
