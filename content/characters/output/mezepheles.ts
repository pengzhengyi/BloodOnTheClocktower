import roleData from './mezepheles.json';
import { Character } from '~/game/character';

export class Mezepheles extends Character {}

Mezepheles.initialize(roleData);
