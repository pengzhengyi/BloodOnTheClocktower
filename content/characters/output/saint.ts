import roleData from './saint.json';
import { Character } from '~/game/character';

export abstract class Saint extends Character {}

Saint.initialize(roleData);
