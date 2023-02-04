import roleData from './deviant.json';
import { Character } from '~/game/character/character';

export abstract class Deviant extends Character {}

Deviant.initialize(roleData);
