import roleData from './leviathan.json';
import { Character } from '~/game/character/character';

export abstract class Leviathan extends Character {}

Leviathan.initialize(roleData);
