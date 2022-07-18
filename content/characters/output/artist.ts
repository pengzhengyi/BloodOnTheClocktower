import roleData from './artist.json';
import { Character } from '~/game/character';

export abstract class Artist extends Character {}

Artist.initialize(roleData);
