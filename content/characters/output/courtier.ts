import roleData from './courtier.json';
import { Character } from '~/game/character';

export class Courtier extends Character {}

Courtier.initialize(roleData);
