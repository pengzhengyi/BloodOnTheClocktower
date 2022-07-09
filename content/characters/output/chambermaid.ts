import roleData from './chambermaid.json';
import { Character } from '~/game/character';

export class Chambermaid extends Character {}

Chambermaid.initialize(roleData);
