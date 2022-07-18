import roleData from './beggar.json';
import { Character } from '~/game/character';

export abstract class Beggar extends Character {}

Beggar.initialize(roleData);
