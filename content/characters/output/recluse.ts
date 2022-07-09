import roleData from './recluse.json';
import { Character } from '~/game/character';

export class Recluse extends Character {}

Recluse.initialize(roleData);
