import roleData from './riot.json';
import { Character } from '~/game/character';

export class Riot extends Character {}

Riot.initialize(roleData);
