import roleData from './assassin.json';
import { Character } from '~/game/character';

export class Assassin extends Character {}

Assassin.initialize(roleData);
