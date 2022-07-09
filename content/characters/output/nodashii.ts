import roleData from './nodashii.json';
import { Character } from '~/game/character';

export class Nodashii extends Character {}

Nodashii.initialize(roleData);
