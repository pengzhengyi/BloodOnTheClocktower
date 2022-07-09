import roleData from './zombuul.json';
import { Character } from '~/game/character';

export class Zombuul extends Character {}

Zombuul.initialize(roleData);
