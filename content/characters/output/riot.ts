import roleData from './riot.json';
import { Character } from '~/game/character';

export abstract class Riot extends Character {}

Riot.initialize(roleData);
