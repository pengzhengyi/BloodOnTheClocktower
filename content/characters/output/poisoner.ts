import roleData from './poisoner.json';
import { Character } from '~/game/character/character';

export abstract class Poisoner extends Character {}

Poisoner.initialize(roleData);
