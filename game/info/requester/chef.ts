import type { ChefInformation } from '../provider/chef';
import { InfoType } from '../info-type';
import { AtFirstNight, CharacterInformationRequester, IsAlive } from './common';
import { type InformationRequestContext } from './requester';
import { CharacterIds } from '~/game/character/character-id';

class BaseChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends CharacterInformationRequester<
    ChefInformation,
    TInformationRequestContext
> {
    readonly infoType = InfoType.ChefInformation;
    readonly origin = CharacterIds.Chef;
}

export interface ChefInformationRequester<
    TInformationRequestContext extends InformationRequestContext<ChefInformation>
> extends BaseChefInformationRequester<TInformationRequestContext> {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ChefInformationRequester = IsAlive(
    AtFirstNight(BaseChefInformationRequester)
);
