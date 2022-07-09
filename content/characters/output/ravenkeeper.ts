import roleData from './ravenkeeper.json';
import { Character } from '~/game/character';

export class Ravenkeeper extends Character {}

Ravenkeeper.initialize(roleData);
