import roleData from './eviltwin.json';
import { Character } from '~/game/character';

export abstract class Eviltwin extends Character {}

Eviltwin.initialize(roleData);
