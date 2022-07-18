import roleData from './marionette.json';
import { Character } from '~/game/character';

export abstract class Marionette extends Character {}

Marionette.initialize(roleData);
