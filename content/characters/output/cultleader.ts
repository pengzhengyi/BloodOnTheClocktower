import roleData from './cultleader.json';
import { Character } from '~/game/character';

export class Cultleader extends Character {}

Cultleader.initialize(roleData);
