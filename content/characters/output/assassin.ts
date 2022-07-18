import roleData from './assassin.json';
import { Character } from '~/game/character';

export abstract class Assassin extends Character {}

Assassin.initialize(roleData);
