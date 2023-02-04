import roleData from './nightwatchman.json';
import { Character } from '~/game/character/character';

export abstract class Nightwatchman extends Character {}

Nightwatchman.initialize(roleData);
