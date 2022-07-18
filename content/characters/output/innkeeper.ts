import roleData from './innkeeper.json';
import { Character } from '~/game/character';

export abstract class Innkeeper extends Character {}

Innkeeper.initialize(roleData);
