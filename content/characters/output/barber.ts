import roleData from './barber.json';
import { Character } from '~/game/character';

export class Barber extends Character {}

Barber.initialize(roleData);
