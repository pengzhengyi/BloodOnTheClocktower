import roleData from './djinn.json';
import { Character } from '~/game/character/character';

export abstract class Djinn extends Character {}

Djinn.initialize(roleData);
