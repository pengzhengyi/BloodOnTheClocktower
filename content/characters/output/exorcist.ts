import roleData from './exorcist.json';
import { Character } from '~/game/character';

export abstract class Exorcist extends Character {}

Exorcist.initialize(roleData);
