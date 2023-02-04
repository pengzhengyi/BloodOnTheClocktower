import roleData from './tealady.json';
import { Character } from '~/game/character/character';

export abstract class TeaLady extends Character {}

TeaLady.initialize(roleData);
