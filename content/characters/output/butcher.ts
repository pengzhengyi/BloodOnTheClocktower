import roleData from './butcher.json';
import { Character } from '~/game/character';

export class Butcher extends Character {}

Butcher.initialize(roleData);
