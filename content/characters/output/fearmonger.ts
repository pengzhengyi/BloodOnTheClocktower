import roleData from './fearmonger.json';
import { Character } from '~/game/character';

export abstract class Fearmonger extends Character {}

Fearmonger.initialize(roleData);
