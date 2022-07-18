import roleData from './butcher.json';
import { Character } from '~/game/character';

export abstract class Butcher extends Character {}

Butcher.initialize(roleData);
