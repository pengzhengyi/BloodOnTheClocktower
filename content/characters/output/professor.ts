import roleData from './professor.json';
import { Character } from '~/game/character';

export class Professor extends Character {}

Professor.initialize(roleData);
