import roleData from './oracle.json';
import { Character } from '~/game/character';

export class Oracle extends Character {}

Oracle.initialize(roleData);
