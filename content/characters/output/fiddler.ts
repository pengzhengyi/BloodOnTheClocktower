import roleData from './fiddler.json';
import { Character } from '~/game/character/character';

export abstract class Fiddler extends Character {}

Fiddler.initialize(roleData);
