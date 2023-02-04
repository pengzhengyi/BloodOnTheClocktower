import roleData from './gunslinger.json';
import { Character } from '~/game/character/character';

export abstract class Gunslinger extends Character {}

Gunslinger.initialize(roleData);
