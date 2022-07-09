import roleData from './barista.json';
import { Character } from '~/game/character';

export class Barista extends Character {}

Barista.initialize(roleData);
