import roleData from './savant.json';
import { Character } from '~/game/character';

export class Savant extends Character {}

Savant.initialize(roleData);
