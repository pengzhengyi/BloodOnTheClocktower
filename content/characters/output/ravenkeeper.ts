import roleData from './ravenkeeper.json';
import { Character } from '~/game/character/character';

export abstract class Ravenkeeper extends Character {}

Ravenkeeper.initialize(roleData);
