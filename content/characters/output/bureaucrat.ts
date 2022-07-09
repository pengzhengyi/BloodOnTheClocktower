import roleData from './bureaucrat.json';
import { Character } from '~/game/character';

export class Bureaucrat extends Character {}

Bureaucrat.initialize(roleData);
