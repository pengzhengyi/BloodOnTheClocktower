import roleData from './atheist.json';
import { Character } from '~/game/character';

export abstract class Atheist extends Character {}

Atheist.initialize(roleData);
