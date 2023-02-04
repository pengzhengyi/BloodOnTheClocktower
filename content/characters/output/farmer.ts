import roleData from './farmer.json';
import { Character } from '~/game/character/character';

export abstract class Farmer extends Character {}

Farmer.initialize(roleData);
