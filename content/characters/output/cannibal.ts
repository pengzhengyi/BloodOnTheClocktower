import roleData from './cannibal.json';
import { Character } from '~/game/character';

export abstract class Cannibal extends Character {}

Cannibal.initialize(roleData);
