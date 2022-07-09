import roleData from './pacifist.json';
import { Character } from '~/game/character';

export class Pacifist extends Character {}

Pacifist.initialize(roleData);
