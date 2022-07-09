import roleData from './sailor.json';
import { Character } from '~/game/character';

export class Sailor extends Character {}

Sailor.initialize(roleData);
