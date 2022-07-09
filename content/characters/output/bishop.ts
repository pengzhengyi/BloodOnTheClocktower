import roleData from './bishop.json';
import { Character } from '~/game/character';

export class Bishop extends Character {}

Bishop.initialize(roleData);
