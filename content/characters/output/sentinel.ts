import roleData from './sentinel.json';
import { Character } from '~/game/character/character';

export abstract class Sentinel extends Character {}

Sentinel.initialize(roleData);
