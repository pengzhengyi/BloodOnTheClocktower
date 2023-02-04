import roleData from './choirboy.json';
import { Character } from '~/game/character/character';

export abstract class Choirboy extends Character {}

Choirboy.initialize(roleData);
