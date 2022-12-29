import roleData from './hellslibrarian.json';
import { Character } from '~/game/character';

export abstract class HellsLibrarian extends Character {}

HellsLibrarian.initialize(roleData);
