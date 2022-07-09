import roleData from './fool.json';
import { Character } from '~/game/character';

export class Fool extends Character {}

Fool.initialize(roleData);
