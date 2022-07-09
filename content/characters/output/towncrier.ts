import roleData from './towncrier.json';
import { Character } from '~/game/character';

export class Towncrier extends Character {}

Towncrier.initialize(roleData);
