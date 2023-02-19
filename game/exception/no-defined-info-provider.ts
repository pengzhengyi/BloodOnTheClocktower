import type { InfoType } from '../info/info-type';
import type { IInfoProviderLoader } from '../info/provider/info-provider-loader';
import { RecoverableGameError } from './exception';

export class NoDefinedInfoProvider extends RecoverableGameError {
    static description =
        'Cannot process an information request because there is no associated info provider';

    constructor(
        readonly infoType: InfoType,
        readonly infoProviderLoader: IInfoProviderLoader
    ) {
        super(NoDefinedInfoProvider.description);
    }
}
