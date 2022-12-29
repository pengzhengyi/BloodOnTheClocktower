import roleData from './stormcatcher.json';
import { Character } from '~/game/character';

export abstract class StormCatcher extends Character {}

StormCatcher.initialize(roleData);
