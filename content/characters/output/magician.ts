import roleData from './magician.json';
import { Character } from '~/game/character';

export abstract class Magician extends Character {}

Magician.initialize(roleData);
