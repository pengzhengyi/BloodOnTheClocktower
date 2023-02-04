import roleData from './washerwoman.json';
import { Character } from '~/game/character/character';

export abstract class Washerwoman extends Character {}

Washerwoman.initialize(roleData);
