import roleData from './huntsman.json';
import { Character } from '~/game/character/character';

export abstract class Huntsman extends Character {}

Huntsman.initialize(roleData);
