import roleData from './gangster.json';
import { Character } from '~/game/character';

export class Gangster extends Character {}

Gangster.initialize(roleData);
