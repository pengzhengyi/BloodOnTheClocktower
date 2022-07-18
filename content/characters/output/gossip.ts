import roleData from './gossip.json';
import { Character } from '~/game/character';

export abstract class Gossip extends Character {}

Gossip.initialize(roleData);
