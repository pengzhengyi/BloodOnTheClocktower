import roleData from './witch.json';
import { Character } from '~/game/character';

export class Witch extends Character {}

Witch.initialize(roleData);
