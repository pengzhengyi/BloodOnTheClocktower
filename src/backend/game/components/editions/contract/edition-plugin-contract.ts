import type { IPluginContract } from '../../../../common/interfaces/plugin-contract';
import type { CanCreateCustomEdition } from './actions/custom-edition-create/can-create-custom-edition';
import type { CanLoadEdition } from './actions/edition-load/can-load-edition';
import type { CanListOfficialEdition } from './actions/official-edition-list/can-list-official-edition';

export interface IEditionPluginContract
    extends CanLoadEdition,
        CanCreateCustomEdition,
        CanListOfficialEdition,
        IPluginContract {}
