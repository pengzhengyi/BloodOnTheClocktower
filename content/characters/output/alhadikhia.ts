import roleData from './alhadikhia.json';
import { Character } from '~/game/character/character';

export abstract class AlHadikhia extends Character {}

AlHadikhia.initialize(roleData);
