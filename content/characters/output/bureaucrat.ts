import roleData from './bureaucrat.json';
import { Character } from '~/game/character';

export abstract class Bureaucrat extends Character {}

Bureaucrat.initialize(roleData);
