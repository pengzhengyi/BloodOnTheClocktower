import roleData from './soldier.json';
import { Character } from '~/game/character';

export abstract class Soldier extends Character {}

Soldier.initialize(roleData);