import roleData from './djinn.json';
import { Character } from '~/game/character';

export class Djinn extends Character {}

Djinn.initialize(roleData);
