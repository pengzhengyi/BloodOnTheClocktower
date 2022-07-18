import roleData from './chambermaid.json';
import { Character } from '~/game/character';

export abstract class Chambermaid extends Character {}

Chambermaid.initialize(roleData);
