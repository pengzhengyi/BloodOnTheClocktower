import roleData from './harlot.json';
import { Character } from '~/game/character/character';

export abstract class Harlot extends Character {}

Harlot.initialize(roleData);
