import roleData from './scarletwoman.json';
import { Character } from '~/game/character';

export abstract class ScarletWoman extends Character {}

ScarletWoman.initialize(roleData);
