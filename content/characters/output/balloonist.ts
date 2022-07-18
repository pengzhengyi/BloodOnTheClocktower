import roleData from './balloonist.json';
import { Character } from '~/game/character';

export abstract class Balloonist extends Character {}

Balloonist.initialize(roleData);
