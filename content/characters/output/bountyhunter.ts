import roleData from './bountyhunter.json';
import { Character } from '~/game/character';

export abstract class BountyHunter extends Character {}

BountyHunter.initialize(roleData);
