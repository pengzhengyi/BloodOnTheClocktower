import roleData from './undertaker.json';
import { Character } from '~/game/character';

export abstract class Undertaker extends Character {}

Undertaker.initialize(roleData);