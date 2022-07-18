import roleData from './cultleader.json';
import { Character } from '~/game/character';

export abstract class Cultleader extends Character {}

Cultleader.initialize(roleData);
