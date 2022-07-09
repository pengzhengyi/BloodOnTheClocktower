import roleData from './pukka.json';
import { Character } from '~/game/character';

export class Pukka extends Character {}

Pukka.initialize(roleData);
