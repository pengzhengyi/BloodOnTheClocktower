import roleData from './lunatic.json';
import { Character } from '~/game/character/character';

export abstract class Lunatic extends Character {}

Lunatic.initialize(roleData);
