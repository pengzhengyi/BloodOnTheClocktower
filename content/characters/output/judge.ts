import roleData from './judge.json';
import { Character } from '~/game/character';

export abstract class Judge extends Character {}

Judge.initialize(roleData);