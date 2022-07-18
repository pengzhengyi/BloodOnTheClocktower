import roleData from './scarletwoman.json';
import { Character } from '~/game/character';

export abstract class Scarletwoman extends Character {}

Scarletwoman.initialize(roleData);
