import roleData from './noble.json';
import { Character } from '~/game/character';

export class Noble extends Character {}

Noble.initialize(roleData);
