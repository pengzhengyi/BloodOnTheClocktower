import roleData from './po.json';
import { Character } from '~/game/character';

export class Po extends Character {}

Po.initialize(roleData);
