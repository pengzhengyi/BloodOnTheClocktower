import roleData from './philosopher.json';
import { Character } from '~/game/character/character';

export abstract class Philosopher extends Character {}

Philosopher.initialize(roleData);
