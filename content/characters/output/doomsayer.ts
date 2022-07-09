import roleData from './doomsayer.json';
import { Character } from '~/game/character';

export class Doomsayer extends Character {}

Doomsayer.initialize(roleData);
