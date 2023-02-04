import roleData from './politician.json';
import { Character } from '~/game/character/character';

export abstract class Politician extends Character {}

Politician.initialize(roleData);
