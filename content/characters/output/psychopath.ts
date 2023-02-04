import roleData from './psychopath.json';
import { Character } from '~/game/character/character';

export abstract class Psychopath extends Character {}

Psychopath.initialize(roleData);
