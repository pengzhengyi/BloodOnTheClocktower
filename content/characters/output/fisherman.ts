import roleData from './fisherman.json';
import { Character } from '~/game/character/character';

export abstract class Fisherman extends Character {}

Fisherman.initialize(roleData);
