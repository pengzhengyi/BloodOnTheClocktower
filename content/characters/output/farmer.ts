import roleData from './farmer.json';
import { Character } from '~/game/character';

export class Farmer extends Character {}

Farmer.initialize(roleData);
