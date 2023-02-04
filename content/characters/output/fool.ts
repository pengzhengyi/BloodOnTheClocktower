import roleData from './fool.json';
import { Character } from '~/game/character/character';

export abstract class Fool extends Character {}

Fool.initialize(roleData);
