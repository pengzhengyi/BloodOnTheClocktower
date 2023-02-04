import roleData from './bountyhunter.json';
import { Character } from '~/game/character/character';

export abstract class BountyHunter extends Character {}

BountyHunter.initialize(roleData);
