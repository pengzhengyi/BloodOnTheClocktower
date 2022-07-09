import roleData from './investigator.json';
import { Character } from '~/game/character';

export class Investigator extends Character {}

Investigator.initialize(roleData);
