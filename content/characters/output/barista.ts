import roleData from './barista.json';
import { Character } from '~/game/character/character';

export abstract class Barista extends Character {}

Barista.initialize(roleData);
