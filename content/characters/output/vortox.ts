import roleData from './vortox.json';
import { Character } from '~/game/character';

export class Vortox extends Character {}

Vortox.initialize(roleData);
