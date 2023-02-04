import roleData from './bishop.json';
import { Character } from '~/game/character/character';

export abstract class Bishop extends Character {}

Bishop.initialize(roleData);
