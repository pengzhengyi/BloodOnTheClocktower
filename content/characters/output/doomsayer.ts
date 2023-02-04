import roleData from './doomsayer.json';
import { Character } from '~/game/character/character';

export abstract class Doomsayer extends Character {}

Doomsayer.initialize(roleData);
