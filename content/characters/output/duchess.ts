import roleData from './duchess.json';
import { Character } from '~/game/character';

export abstract class Duchess extends Character {}

Duchess.initialize(roleData);
