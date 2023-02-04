import roleData from './cerenovus.json';
import { Character } from '~/game/character/character';

export abstract class Cerenovus extends Character {}

Cerenovus.initialize(roleData);
