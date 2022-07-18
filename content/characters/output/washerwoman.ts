import roleData from './washerwoman.json';
import { Character } from '~/game/character';

export abstract class Washerwoman extends Character {}

Washerwoman.initialize(roleData);
