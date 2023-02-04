import roleData from './king.json';
import { Character } from '~/game/character/character';

export abstract class King extends Character {}

King.initialize(roleData);
