import roleData from './eviltwin.json';
import { Character } from '~/game/character/character';

export abstract class EvilTwin extends Character {}

EvilTwin.initialize(roleData);
