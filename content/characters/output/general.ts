import roleData from './general.json';
import { Character } from '~/game/character/character';

export abstract class General extends Character {}

General.initialize(roleData);
