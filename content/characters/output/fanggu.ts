import roleData from './fanggu.json';
import { Character } from '~/game/character';

export abstract class Fanggu extends Character {}

Fanggu.initialize(roleData);
