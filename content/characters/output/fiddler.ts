import roleData from './fiddler.json';
import { Character } from '~/game/character';

export class Fiddler extends Character {}

Fiddler.initialize(roleData);
