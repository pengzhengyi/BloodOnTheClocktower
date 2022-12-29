import roleData from './devilsadvocate.json';
import { Character } from '~/game/character';

export abstract class DevilsAdvocate extends Character {}

DevilsAdvocate.initialize(roleData);
