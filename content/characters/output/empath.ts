import roleData from './empath.json';
import { Character } from '~/game/character';

export abstract class Empath extends Character {}

Empath.initialize(roleData);
