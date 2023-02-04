import roleData from './pacifist.json';
import { Character } from '~/game/character/character';

export abstract class Pacifist extends Character {}

Pacifist.initialize(roleData);
