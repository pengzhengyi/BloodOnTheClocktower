import roleData from './clockmaker.json';
import { Character } from '~/game/character';

export abstract class Clockmaker extends Character {}

Clockmaker.initialize(roleData);
