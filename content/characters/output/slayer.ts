import roleData from './slayer.json';
import { Character } from '~/game/character/character';

export abstract class Slayer extends Character {}

Slayer.initialize(roleData);
