import roleData from './acrobat.json';
import { Character } from '~/game/character/character';

export abstract class Acrobat extends Character {}

Acrobat.initialize(roleData);
