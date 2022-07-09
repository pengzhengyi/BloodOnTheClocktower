import roleData from './fisherman.json';
import { Character } from '~/game/character';

export class Fisherman extends Character {}

Fisherman.initialize(roleData);
