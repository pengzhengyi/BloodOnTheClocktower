import roleData from './duchess.json';
import { Character } from '~/game/character/character';

export abstract class Duchess extends Character {}

Duchess.initialize(roleData);
