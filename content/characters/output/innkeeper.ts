import roleData from './innkeeper.json';
import { Character } from '~/game/character';

export class Innkeeper extends Character {}

Innkeeper.initialize(roleData);
