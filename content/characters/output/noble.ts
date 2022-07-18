import roleData from './noble.json';
import { Character } from '~/game/character';

export abstract class Noble extends Character {}

Noble.initialize(roleData);
