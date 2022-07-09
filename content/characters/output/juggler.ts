import roleData from './juggler.json';
import { Character } from '~/game/character';

export class Juggler extends Character {}

Juggler.initialize(roleData);
