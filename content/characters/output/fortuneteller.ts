import roleData from './fortuneteller.json';
import { Character } from '~/game/character';

export class Fortuneteller extends Character {}

Fortuneteller.initialize(roleData);
