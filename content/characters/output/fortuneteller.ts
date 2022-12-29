import roleData from './fortuneteller.json';
import { Character } from '~/game/character';

export abstract class FortuneTeller extends Character {}

FortuneTeller.initialize(roleData);
