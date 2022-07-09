import roleData from './exorcist.json';
import { Character } from '~/game/character';

export class Exorcist extends Character {}

Exorcist.initialize(roleData);
