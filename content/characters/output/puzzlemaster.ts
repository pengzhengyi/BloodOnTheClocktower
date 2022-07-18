import roleData from './puzzlemaster.json';
import { Character } from '~/game/character';

export abstract class Puzzlemaster extends Character {}

Puzzlemaster.initialize(roleData);
