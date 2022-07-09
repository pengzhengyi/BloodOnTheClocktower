import roleData from './mathematician.json';
import { Character } from '~/game/character';

export class Mathematician extends Character {}

Mathematician.initialize(roleData);
