import roleData from './mephit.json';
import { Character } from '~/game/character';

export class Mephit extends Character {}

Mephit.initialize(roleData);
