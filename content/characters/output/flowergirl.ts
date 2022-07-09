import roleData from './flowergirl.json';
import { Character } from '~/game/character';

export class Flowergirl extends Character {}

Flowergirl.initialize(roleData);
