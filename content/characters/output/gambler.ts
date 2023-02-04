import roleData from './gambler.json';
import { Character } from '~/game/character/character';

export abstract class Gambler extends Character {}

Gambler.initialize(roleData);
