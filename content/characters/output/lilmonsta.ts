import roleData from './lilmonsta.json';
import { Character } from '~/game/character/character';

export abstract class LilMonsta extends Character {}

LilMonsta.initialize(roleData);
