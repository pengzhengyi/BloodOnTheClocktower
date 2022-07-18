import roleData from './shabaloth.json';
import { Character } from '~/game/character';

export abstract class Shabaloth extends Character {}

Shabaloth.initialize(roleData);
