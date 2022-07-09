import roleData from './balloonist.json';
import { Character } from '~/game/character';

export class Balloonist extends Character {}

Balloonist.initialize(roleData);
