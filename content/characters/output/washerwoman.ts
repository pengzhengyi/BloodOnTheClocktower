import roleData from './washerwoman.json';
import { Character } from '~/game/character';

export class Washerwoman extends Character {}

Washerwoman.initialize(roleData);
