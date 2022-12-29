import roleData from './poppygrower.json';
import { Character } from '~/game/character';

export abstract class PoppyGrower extends Character {}

PoppyGrower.initialize(roleData);
