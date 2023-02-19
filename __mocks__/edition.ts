import type { IEdition } from '~/game/edition/edition';
import type { EditionId } from '~/game/edition/edition-id';
import { EditionIds } from '~/game/edition/edition-id';
import { GameEnvironment } from '~/game/environment';

export function getEdition(id: EditionId): IEdition {
    return GameEnvironment.current.editionLoader.load(id);
}

export const TroubleBrewing = getEdition(EditionIds.TroubleBrewing);
