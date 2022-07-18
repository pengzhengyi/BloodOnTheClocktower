import roleData from './hellslibrarian.json';
import { Character } from '~/game/character';

export abstract class Hellslibrarian extends Character {}

Hellslibrarian.initialize(roleData);
