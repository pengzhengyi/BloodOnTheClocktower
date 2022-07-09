import roleData from './lunatic.json';
import { Character } from '~/game/character';

export class Lunatic extends Character {}

Lunatic.initialize(roleData);
