import roleData from './stormcatcher.json';
import { Character } from '~/game/character';

export class Stormcatcher extends Character {}

Stormcatcher.initialize(roleData);
