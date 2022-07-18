import roleData from './psychopath.json';
import { Character } from '~/game/character';

export abstract class Psychopath extends Character {}

Psychopath.initialize(roleData);
