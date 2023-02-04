import roleData from './clockmaker.json';
import { Character } from '~/game/character/character';

export abstract class Clockmaker extends Character {}

Clockmaker.initialize(roleData);
