import roleData from './politician.json';
import { Character } from '~/game/character';

export class Politician extends Character {}

Politician.initialize(roleData);
