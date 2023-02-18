import { TroubleBrewing } from './TroubleBrewing';
import { SectsViolets } from './SectsViolets';
import { BadMoonRising } from './BadMoonRising';
import { ExperimentalCharacters } from './ExperimentalCharacters';
import { Edition } from '~/game/edition/edition';
import { createRecordProxy } from '~/game/proxy/proxy';

const canonicalNameToEdition: Map<string, typeof Edition> = new Map();
canonicalNameToEdition.set(TroubleBrewing.canonicalName, TroubleBrewing);
canonicalNameToEdition.set(SectsViolets.canonicalName, SectsViolets);
canonicalNameToEdition.set(BadMoonRising.canonicalName, BadMoonRising);
canonicalNameToEdition.set(
    ExperimentalCharacters.canonicalName,
    ExperimentalCharacters
);

export const NAME_TO_EDITION: Record<string, typeof Edition> =
    createRecordProxy((name) =>
        canonicalNameToEdition.get(Edition.getCanonicalName(name))
    );
