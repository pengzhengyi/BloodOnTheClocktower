import roleData from './legion.json';
import { Character } from '~/game/character/character';

export abstract class Legion extends Character {}

Legion.initialize(roleData);
