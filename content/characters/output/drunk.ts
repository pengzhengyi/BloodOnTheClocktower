import roleData from './drunk.json';
import { Character } from '~/game/character';

export class Drunk extends Character {}

Drunk.initialize(roleData);
