import roleData from './artist.json';
import { Character } from '~/game/character/character';

export abstract class Artist extends Character {}

Artist.initialize(roleData);
