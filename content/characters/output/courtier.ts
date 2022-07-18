import roleData from './courtier.json';
import { Character } from '~/game/character';

export abstract class Courtier extends Character {}

Courtier.initialize(roleData);
