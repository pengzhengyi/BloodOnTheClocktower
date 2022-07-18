import roleData from './mathematician.json';
import { Character } from '~/game/character';

export abstract class Mathematician extends Character {}

Mathematician.initialize(roleData);
