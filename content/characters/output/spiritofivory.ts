import roleData from './spiritofivory.json';
import { Character } from '~/game/character';

export abstract class SpiritOfIvory extends Character {}

SpiritOfIvory.initialize(roleData);
