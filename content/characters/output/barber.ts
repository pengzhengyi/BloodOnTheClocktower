import roleData from './barber.json';
import { Character } from '~/game/character/character';

export abstract class Barber extends Character {}

Barber.initialize(roleData);
