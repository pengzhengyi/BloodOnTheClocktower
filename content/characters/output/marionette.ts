import roleData from './marionette.json';
import { Character } from '~/game/character';

export class Marionette extends Character {}

Marionette.initialize(roleData);
