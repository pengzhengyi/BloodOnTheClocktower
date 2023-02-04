import roleData from './boomdandy.json';
import { Character } from '~/game/character/character';

export abstract class Boomdandy extends Character {}

Boomdandy.initialize(roleData);
