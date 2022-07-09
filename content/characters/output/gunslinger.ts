import roleData from './gunslinger.json';
import { Character } from '~/game/character';

export class Gunslinger extends Character {}

Gunslinger.initialize(roleData);
