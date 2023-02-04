import type { ChefInformation } from '../provider/chef';
import { AtFirstNight, CharacterInformationRequester, IsAlive } from './common';
import { type InformationRequestContext } from './requester';
import { Chef } from '~/content/characters/output/chef';

class BaseChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends CharacterInformationRequester<
    ChefInformation,
    TInformationRequestContext
> {
    readonly expectedCharacter = Chef;
}

export interface ChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends BaseChefInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ChefInformationRequester = IsAlive(
    AtFirstNight(BaseChefInformationRequester)
);
