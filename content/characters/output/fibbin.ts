import roleData from './fibbin.json';
import { Character } from '~/game/character';

export class Fibbin extends Character {}

Fibbin.initialize(roleData);
