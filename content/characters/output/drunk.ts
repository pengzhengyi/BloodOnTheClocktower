import roleData from './drunk.json';
import { Character } from '~/game/character/character';

export abstract class Drunk extends Character {}

Drunk.initialize(roleData);
