import roleData from './deviant.json';
import { Character } from '~/game/character';

export class Deviant extends Character {}

Deviant.initialize(roleData);
