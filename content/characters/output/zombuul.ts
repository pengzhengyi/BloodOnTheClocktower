import roleData from './zombuul.json';
import { Character } from '~/game/character';

export abstract class Zombuul extends Character {}

Zombuul.initialize(roleData);
