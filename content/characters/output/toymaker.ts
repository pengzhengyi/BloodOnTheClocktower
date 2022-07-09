import roleData from './toymaker.json';
import { Character } from '~/game/character';

export class Toymaker extends Character {}

Toymaker.initialize(roleData);
