import roleData from './nodashii.json';
import { Character } from '~/game/character';

export abstract class Nodashii extends Character {}

Nodashii.initialize(roleData);
