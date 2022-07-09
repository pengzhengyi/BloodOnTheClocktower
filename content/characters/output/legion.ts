import roleData from './legion.json';
import { Character } from '~/game/character';

export class Legion extends Character {}

Legion.initialize(roleData);
