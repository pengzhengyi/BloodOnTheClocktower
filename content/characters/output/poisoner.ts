import roleData from './poisoner.json';
import { Character } from '~/game/character';

export class Poisoner extends Character {}

Poisoner.initialize(roleData);
