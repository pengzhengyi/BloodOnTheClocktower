import roleData from './snakecharmer.json';
import { Character } from '~/game/character';

export abstract class Snakecharmer extends Character {}

Snakecharmer.initialize(roleData);
