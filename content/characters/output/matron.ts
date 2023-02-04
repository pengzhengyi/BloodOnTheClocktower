import roleData from './matron.json';
import { Character } from '~/game/character/character';

export abstract class Matron extends Character {}

Matron.initialize(roleData);
