import roleData from './professor.json';
import { Character } from '~/game/character/character';

export abstract class Professor extends Character {}

Professor.initialize(roleData);
