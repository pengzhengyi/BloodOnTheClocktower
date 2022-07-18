import roleData from './ravenkeeper.json';
import { Character } from '~/game/character';

export abstract class Ravenkeeper extends Character {}

Ravenkeeper.initialize(roleData);
