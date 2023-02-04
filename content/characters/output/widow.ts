import roleData from './widow.json';
import { Character } from '~/game/character/character';

export abstract class Widow extends Character {}

Widow.initialize(roleData);
