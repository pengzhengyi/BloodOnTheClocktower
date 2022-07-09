import roleData from './buddhist.json';
import { Character } from '~/game/character';

export class Buddhist extends Character {}

Buddhist.initialize(roleData);
