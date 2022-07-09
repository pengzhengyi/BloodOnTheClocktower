import roleData from './monk.json';
import { Character } from '~/game/character';

export class Monk extends Character {}

Monk.initialize(roleData);
