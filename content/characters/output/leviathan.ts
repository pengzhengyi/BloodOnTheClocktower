import roleData from './leviathan.json';
import { Character } from '~/game/character';

export class Leviathan extends Character {}

Leviathan.initialize(roleData);
