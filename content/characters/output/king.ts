import roleData from './king.json';
import { Character } from '~/game/character';

export class King extends Character {}

King.initialize(roleData);
