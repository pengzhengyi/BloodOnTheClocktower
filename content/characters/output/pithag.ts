import roleData from './pithag.json';
import { Character } from '~/game/character/character';

export abstract class PitHag extends Character {}

PitHag.initialize(roleData);
