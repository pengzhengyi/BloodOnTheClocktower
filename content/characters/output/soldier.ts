import roleData from './soldier.json';
import { Character } from '~/game/character';

export class Soldier extends Character {}

Soldier.initialize(roleData);
