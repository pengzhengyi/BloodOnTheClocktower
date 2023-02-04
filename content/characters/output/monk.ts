import roleData from './monk.json';
import { Character } from '~/game/character/character';

export abstract class Monk extends Character {}

Monk.initialize(roleData);
