import roleData from './stormcatcher.json';
import { Character } from '~/game/character';

export abstract class Stormcatcher extends Character {}

Stormcatcher.initialize(roleData);
