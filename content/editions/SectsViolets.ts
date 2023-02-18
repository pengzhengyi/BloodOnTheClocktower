import editionData from './SectsViolets.json';
import { Edition } from '~/game/edition/edition';

export class SectsViolets extends Edition {}

SectsViolets.initialize(editionData);
