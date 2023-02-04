import roleData from './pukka.json';
import { Character } from '~/game/character/character';

export abstract class Pukka extends Character {}

Pukka.initialize(roleData);
