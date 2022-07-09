import roleData from './damsel.json';
import { Character } from '~/game/character';

export class Damsel extends Character {}

Damsel.initialize(roleData);
