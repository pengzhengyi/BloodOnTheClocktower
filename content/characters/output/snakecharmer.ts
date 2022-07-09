import roleData from './snakecharmer.json';
import { Character } from '~/game/character';

export class Snakecharmer extends Character {}

Snakecharmer.initialize(roleData);
