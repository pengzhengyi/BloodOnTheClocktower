import roleData from './beggar.json';
import { Character } from '~/game/character';

export class Beggar extends Character {}

Beggar.initialize(roleData);
