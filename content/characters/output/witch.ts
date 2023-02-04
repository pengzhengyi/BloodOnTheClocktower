import roleData from './witch.json';
import { Character } from '~/game/character/character';

export abstract class Witch extends Character {}

Witch.initialize(roleData);
