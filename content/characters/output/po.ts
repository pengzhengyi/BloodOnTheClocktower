import roleData from './po.json';
import { Character } from '~/game/character/character';

export abstract class Po extends Character {}

Po.initialize(roleData);
