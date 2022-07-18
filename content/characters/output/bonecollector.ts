import roleData from './bonecollector.json';
import { Character } from '~/game/character';

export abstract class Bonecollector extends Character {}

Bonecollector.initialize(roleData);
