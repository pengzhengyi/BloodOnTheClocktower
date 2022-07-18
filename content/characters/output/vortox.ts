import roleData from './vortox.json';
import { Character } from '~/game/character';

export abstract class Vortox extends Character {}

Vortox.initialize(roleData);
