import roleData from './nodashii.json';
import { Character } from '~/game/character/character';

export abstract class NoDashii extends Character {}

NoDashii.initialize(roleData);
