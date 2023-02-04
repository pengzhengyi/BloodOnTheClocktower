import roleData from './lleech.json';
import { Character } from '~/game/character/character';

export abstract class Lleech extends Character {}

Lleech.initialize(roleData);
