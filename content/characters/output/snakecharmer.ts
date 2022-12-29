import roleData from './snakecharmer.json';
import { Character } from '~/game/character';

export abstract class SnakeCharmer extends Character {}

SnakeCharmer.initialize(roleData);
