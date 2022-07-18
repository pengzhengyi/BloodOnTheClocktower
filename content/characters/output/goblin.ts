import roleData from './goblin.json';
import { Character } from '~/game/character';

export abstract class Goblin extends Character {}

Goblin.initialize(roleData);
