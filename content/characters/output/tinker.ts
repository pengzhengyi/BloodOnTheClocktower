import roleData from './tinker.json';
import { Character } from '~/game/character';

export abstract class Tinker extends Character {}

Tinker.initialize(roleData);
