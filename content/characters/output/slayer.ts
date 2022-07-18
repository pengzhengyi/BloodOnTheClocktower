import roleData from './slayer.json';
import { Character } from '~/game/character';

export abstract class Slayer extends Character {}

Slayer.initialize(roleData);
