import roleData from './matron.json';
import { Character } from '~/game/character';

export class Matron extends Character {}

Matron.initialize(roleData);
