import roleData from './assassin.json';
import { Character } from '~/game/character/character';

export abstract class Assassin extends Character {}

Assassin.initialize(roleData);
