import roleData from './fibbin.json';
import { Character } from '~/game/character';

export abstract class Fibbin extends Character {}

Fibbin.initialize(roleData);
