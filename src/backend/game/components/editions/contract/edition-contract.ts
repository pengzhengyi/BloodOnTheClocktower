import type { IComponentContract } from '../../../../common/interfaces/component-contract';
import type { CanCreateCustomEdition } from './actions/custom-edition-create/can-create-custom-edition';
import type { CanLoadEdition } from './actions/edition-load/can-load-edition';
import type { CanListOfficialEdition } from './actions/official-edition-list/can-list-official-edition';

export interface IEditionContract
    extends CanLoadEdition,
        CanCreateCustomEdition,
        CanListOfficialEdition,
        IComponentContract {}
