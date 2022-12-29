import roleData from './towncrier.json';
import { Character } from '~/game/character';

export abstract class TownCrier extends Character {}

TownCrier.initialize(roleData);
