import roleData from './damsel.json';
import { Character } from '~/game/character/character';

export abstract class Damsel extends Character {}

Damsel.initialize(roleData);
