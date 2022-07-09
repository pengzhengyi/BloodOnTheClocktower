import roleData from './amnesiac.json';
import { Character } from '~/game/character';

export class Amnesiac extends Character {}

Amnesiac.initialize(roleData);
