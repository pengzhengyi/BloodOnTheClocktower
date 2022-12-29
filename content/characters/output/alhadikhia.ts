import roleData from './alhadikhia.json';
import { Character } from '~/game/character';

export abstract class AlHadikhia extends Character {}

AlHadikhia.initialize(roleData);
