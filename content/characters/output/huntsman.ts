import roleData from './huntsman.json';
import { Character } from '~/game/character';

export class Huntsman extends Character {}

Huntsman.initialize(roleData);
