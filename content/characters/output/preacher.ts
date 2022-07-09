import roleData from './preacher.json';
import { Character } from '~/game/character';

export class Preacher extends Character {}

Preacher.initialize(roleData);
