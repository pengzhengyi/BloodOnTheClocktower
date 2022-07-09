import roleData from './philosopher.json';
import { Character } from '~/game/character';

export class Philosopher extends Character {}

Philosopher.initialize(roleData);
