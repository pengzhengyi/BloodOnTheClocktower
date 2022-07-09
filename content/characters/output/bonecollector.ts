import roleData from './bonecollector.json';
import { Character } from '~/game/character';

export class Bonecollector extends Character {}

Bonecollector.initialize(roleData);
