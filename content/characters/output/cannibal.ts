import roleData from './cannibal.json';
import { Character } from '~/game/character';

export class Cannibal extends Character {}

Cannibal.initialize(roleData);
