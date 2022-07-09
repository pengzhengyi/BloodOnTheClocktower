import roleData from './eviltwin.json';
import { Character } from '~/game/character';

export class Eviltwin extends Character {}

Eviltwin.initialize(roleData);
