import roleData from './lilmonsta.json';
import { Character } from '~/game/character';

export class Lilmonsta extends Character {}

Lilmonsta.initialize(roleData);
