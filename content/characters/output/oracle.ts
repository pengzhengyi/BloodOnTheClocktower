import roleData from './oracle.json';
import { Character } from '~/game/character/character';

export abstract class Oracle extends Character {}

Oracle.initialize(roleData);
