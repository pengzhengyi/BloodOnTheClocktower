import editionData from './BadMoonRising.json';
import { Edition } from '~/game/edition/edition';

export class BadMoonRising extends Edition {}

BadMoonRising.initialize(editionData);
