import roleData from './fanggu.json';
import { Character } from '~/game/character/character';

export abstract class FangGu extends Character {}

FangGu.initialize(roleData);
