import type { ILoader } from '../../../../common/interfaces/loader';
import type { IEdition } from '../edition';
import type { EditionId } from '../id/edition-id';

export interface IEditionLoader extends ILoader<EditionId, IEdition> {}
