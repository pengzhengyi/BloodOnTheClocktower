import roleData from './mephit.json';
import { Character } from '~/game/character';

export abstract class Mephit extends Character {}

Mephit.initialize(roleData);
