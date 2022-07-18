import roleData from './lilmonsta.json';
import { Character } from '~/game/character';

export abstract class Lilmonsta extends Character {}

Lilmonsta.initialize(roleData);
