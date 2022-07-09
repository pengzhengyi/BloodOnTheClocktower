import roleData from './acrobat.json';
import { Character } from '~/game/character';

export class Acrobat extends Character {}

Acrobat.initialize(roleData);
