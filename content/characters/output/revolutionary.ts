import roleData from './revolutionary.json';
import { Character } from '~/game/character';

export abstract class Revolutionary extends Character {}

Revolutionary.initialize(roleData);
