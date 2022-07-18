import roleData from './gangster.json';
import { Character } from '~/game/character';

export abstract class Gangster extends Character {}

Gangster.initialize(roleData);
