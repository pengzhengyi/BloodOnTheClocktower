import roleData from './sailor.json';
import { Character } from '~/game/character';

export abstract class Sailor extends Character {}

Sailor.initialize(roleData);
