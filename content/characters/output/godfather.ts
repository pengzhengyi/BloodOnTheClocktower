import roleData from './godfather.json';
import { Character } from '~/game/character';

export abstract class Godfather extends Character {}

Godfather.initialize(roleData);
