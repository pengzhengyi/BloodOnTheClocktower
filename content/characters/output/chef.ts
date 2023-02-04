import roleData from './chef.json';
import { Character } from '~/game/character/character';

export abstract class Chef extends Character {}

Chef.initialize(roleData);
