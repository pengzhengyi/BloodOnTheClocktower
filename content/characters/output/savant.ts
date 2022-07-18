import roleData from './savant.json';
import { Character } from '~/game/character';

export abstract class Savant extends Character {}

Savant.initialize(roleData);
