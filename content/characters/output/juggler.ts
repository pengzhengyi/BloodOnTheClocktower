import roleData from './juggler.json';
import { Character } from '~/game/character';

export abstract class Juggler extends Character {}

Juggler.initialize(roleData);
