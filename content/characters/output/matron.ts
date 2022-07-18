import roleData from './matron.json';
import { Character } from '~/game/character';

export abstract class Matron extends Character {}

Matron.initialize(roleData);
