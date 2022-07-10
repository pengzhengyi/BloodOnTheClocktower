import editionData from './ExperimentalCharacters.json';
import { Edition } from '~/game/edition';

export class ExperimentalCharacters extends Edition {}

ExperimentalCharacters.initialize(editionData);
