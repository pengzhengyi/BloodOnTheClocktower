import roleData from './alhadikhia.json';
import { Character } from '~/game/character';

export abstract class Alhadikhia extends Character {}

Alhadikhia.initialize(roleData);
