import roleData from './flowergirl.json';
import { Character } from '~/game/character/character';

export abstract class Flowergirl extends Character {}

Flowergirl.initialize(roleData);
