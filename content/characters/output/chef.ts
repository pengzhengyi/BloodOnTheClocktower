import roleData from './chef.json';
import { Character } from '~/game/character';

export class Chef extends Character {}

Chef.initialize(roleData);
