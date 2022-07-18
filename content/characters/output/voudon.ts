import roleData from './voudon.json';
import { Character } from '~/game/character';

export abstract class Voudon extends Character {}

Voudon.initialize(roleData);
