import roleData from './bountyhunter.json';
import { Character } from '~/game/character';

export class Bountyhunter extends Character {}

Bountyhunter.initialize(roleData);
