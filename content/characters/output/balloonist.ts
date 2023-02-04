import roleData from './balloonist.json';
import { Character } from '~/game/character/character';

export abstract class Balloonist extends Character {}

Balloonist.initialize(roleData);
