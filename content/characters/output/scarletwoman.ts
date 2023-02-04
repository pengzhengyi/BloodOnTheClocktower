import roleData from './scarletwoman.json';
import { Character } from '~/game/character/character';

export abstract class ScarletWoman extends Character {}

ScarletWoman.initialize(roleData);
