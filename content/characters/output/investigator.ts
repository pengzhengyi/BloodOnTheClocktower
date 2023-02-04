import roleData from './investigator.json';
import { Character } from '~/game/character/character';

export abstract class Investigator extends Character {}

Investigator.initialize(roleData);
