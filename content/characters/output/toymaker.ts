import roleData from './toymaker.json';
import { Character } from '~/game/character';

export abstract class Toymaker extends Character {}

Toymaker.initialize(roleData);