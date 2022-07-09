import roleData from './librarian.json';
import { Character } from '~/game/character';

export class Librarian extends Character {}

Librarian.initialize(roleData);
