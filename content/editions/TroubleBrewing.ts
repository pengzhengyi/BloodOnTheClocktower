import editionData from './TroubleBrewing.json';
import { Edition } from '~/game/edition';

export class TroubleBrewing extends Edition {}

TroubleBrewing.initialize(editionData);
