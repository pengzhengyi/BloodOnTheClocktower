import roleData from './golem.json';
import { Character } from '~/game/character';

export class Golem extends Character {}

Golem.initialize(roleData);