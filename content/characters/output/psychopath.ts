import roleData from './psychopath.json';
import { Character } from '~/game/character';

export class Psychopath extends Character {}

Psychopath.initialize(roleData);
