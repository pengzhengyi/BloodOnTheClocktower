import roleData from './amnesiac.json';
import { Character } from '~/game/character';

export abstract class Amnesiac extends Character {}

Amnesiac.initialize(roleData);
