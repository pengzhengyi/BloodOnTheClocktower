import { TroubleBrewing } from './TroubleBrewing';
import { SectsViolets } from './SectsViolets';
import { BadMoonRising } from './BadMoonRising';
import { ExperimentalCharacters } from './ExperimentalCharacters';
import { type Edition } from '~/game/edition';

export const NAME_TO_EDITION: Map<string, typeof Edition> = new Map();
NAME_TO_EDITION.set('TroubleBrewing', TroubleBrewing);
NAME_TO_EDITION.set('SectsViolets', SectsViolets);
NAME_TO_EDITION.set('BadMoonRising', BadMoonRising);
NAME_TO_EDITION.set('ExperimentalCharacters', ExperimentalCharacters);
