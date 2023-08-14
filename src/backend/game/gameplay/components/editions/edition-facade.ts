import type { IFacade } from '../../../../common/interfaces/facade';
import type { IEditionContract } from './contract/edition-contract';

export interface IEditionFacade extends IFacade, IEditionContract {}
