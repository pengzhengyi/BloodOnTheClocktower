import roleData from './mastermind.json';
import { Character } from '~/game/character';

export abstract class Mastermind extends Character {}

Mastermind.initialize(roleData);
