import roleData from './pixie.json';
import { Character } from '~/game/character';

export class Pixie extends Character {}

Pixie.initialize(roleData);
