import roleData from './devilsadvocate.json';
import { Character } from '~/game/character';

export abstract class Devilsadvocate extends Character {}

Devilsadvocate.initialize(roleData);
