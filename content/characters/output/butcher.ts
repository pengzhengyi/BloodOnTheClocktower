import roleData from './butcher.json';
import { Character } from '~/game/character/character';

export abstract class Butcher extends Character {}

Butcher.initialize(roleData);
