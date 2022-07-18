import roleData from './scapegoat.json';
import { Character } from '~/game/character';

export abstract class Scapegoat extends Character {}

Scapegoat.initialize(roleData);
