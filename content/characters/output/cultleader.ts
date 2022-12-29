import roleData from './cultleader.json';
import { Character } from '~/game/character';

export abstract class CultLeader extends Character {}

CultLeader.initialize(roleData);
