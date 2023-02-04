import roleData from './savant.json';
import { Character } from '~/game/character/character';

export abstract class Savant extends Character {}

Savant.initialize(roleData);
