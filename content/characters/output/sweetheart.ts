import roleData from './sweetheart.json';
import { Character } from '~/game/character';

export abstract class Sweetheart extends Character {}

Sweetheart.initialize(roleData);
