import roleData from './fortuneteller.json';
import { Character } from '~/game/character';

export abstract class Fortuneteller extends Character {}

Fortuneteller.initialize(roleData);
