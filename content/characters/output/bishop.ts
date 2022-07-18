import roleData from './bishop.json';
import { Character } from '~/game/character';

export abstract class Bishop extends Character {}

Bishop.initialize(roleData);
