import roleData from './clockmaker.json';
import { Character } from '~/game/character';

export class Clockmaker extends Character {}

Clockmaker.initialize(roleData);
