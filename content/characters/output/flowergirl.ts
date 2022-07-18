import roleData from './flowergirl.json';
import { Character } from '~/game/character';

export abstract class Flowergirl extends Character {}

Flowergirl.initialize(roleData);
