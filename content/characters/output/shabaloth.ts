import roleData from './shabaloth.json';
import { Character } from '~/game/character';

export class Shabaloth extends Character {}

Shabaloth.initialize(roleData);
