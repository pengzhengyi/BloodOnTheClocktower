import roleData from './bountyhunter.json';
import { Character } from '~/game/character';

export abstract class Bountyhunter extends Character {}

Bountyhunter.initialize(roleData);
