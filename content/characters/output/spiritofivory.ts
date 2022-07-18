import roleData from './spiritofivory.json';
import { Character } from '~/game/character';

export abstract class Spiritofivory extends Character {}

Spiritofivory.initialize(roleData);
