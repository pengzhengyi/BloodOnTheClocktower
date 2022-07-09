import roleData from './cerenovus.json';
import { Character } from '~/game/character';

export class Cerenovus extends Character {}

Cerenovus.initialize(roleData);
