import roleData from './leviathan.json';
import { Character } from '~/game/character';

export abstract class Leviathan extends Character {}

Leviathan.initialize(roleData);
