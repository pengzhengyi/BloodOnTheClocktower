import roleData from './mutant.json';
import { Character } from '~/game/character/character';

export abstract class Mutant extends Character {}

Mutant.initialize(roleData);
