import roleData from './buddhist.json';
import { Character } from '~/game/character';

export abstract class Buddhist extends Character {}

Buddhist.initialize(roleData);