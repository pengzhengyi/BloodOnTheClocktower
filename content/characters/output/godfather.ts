import roleData from './godfather.json';
import { Character } from '~/game/character';

export class Godfather extends Character {}

Godfather.initialize(roleData);
