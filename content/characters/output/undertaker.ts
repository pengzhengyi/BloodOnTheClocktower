import roleData from './undertaker.json';
import { Character } from '~/game/character';

export class Undertaker extends Character {}

Undertaker.initialize(roleData);
