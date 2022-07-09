import roleData from './gambler.json';
import { Character } from '~/game/character';

export class Gambler extends Character {}

Gambler.initialize(roleData);
