import roleData from './librarian.json';
import { Character } from '~/game/character/character';

export abstract class Librarian extends Character {}

Librarian.initialize(roleData);
