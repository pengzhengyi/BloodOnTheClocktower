import roleData from './choirboy.json';
import { Character } from '~/game/character';

export class Choirboy extends Character {}

Choirboy.initialize(roleData);
