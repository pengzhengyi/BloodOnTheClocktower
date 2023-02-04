import roleData from './pixie.json';
import { Character } from '~/game/character/character';

export abstract class Pixie extends Character {}

Pixie.initialize(roleData);
