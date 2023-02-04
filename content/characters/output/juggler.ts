import roleData from './juggler.json';
import { Character } from '~/game/character/character';

export abstract class Juggler extends Character {}

Juggler.initialize(roleData);
