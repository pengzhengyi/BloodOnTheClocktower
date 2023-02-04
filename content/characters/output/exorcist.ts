import roleData from './exorcist.json';
import { Character } from '~/game/character/character';

export abstract class Exorcist extends Character {}

Exorcist.initialize(roleData);
