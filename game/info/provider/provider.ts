import type {
    FalseInformationOptions,
    TrueInformationOptions,
} from '../information';
import type { StoryTellerInformationOptions } from '../storyteller-information';
import type { InfoType } from '../info-type';
import type { ICharacterSheet } from '~/game/character/character-sheet';
import type { IClocktower } from '~/game/clocktower/clocktower';
import { LazyMap } from '~/game/collections';
import type { IPlayer } from '~/game/player';
import type { IPlayers } from '~/game/players';
import type { ISeating } from '~/game/seating/seating';
import type { IStoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/traveller-sheet';
import type { RequireInfoType } from '~/game/types';

export interface InfoProvideContext {
    clocktower: IClocktower;
    characterSheet: ICharacterSheet;
    travellerSheet: TravellerSheet;
    requestedPlayer: IPlayer;
    players: IPlayers;
    storyteller: IStoryTeller;
    seating: ISeating;
    reason?: string;
}

export interface IInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> extends RequireInfoType {
    /**
     * Give a score for a piece of information based on its "goodness". Positive score means this information is helpful while negative score means it is misleading. Zero means no evaluation is provided. This score can be used in UI to sort options available for storyteller to choose from.
     * @param information The information to be evaluated.
     * @param context The context where the information is requested
     * @param evaluationContext A context used for caching expensive computation purpose in evaluation of information goodness. By passing in same evaluation context, the implementation might take advantage of any saved information.
     * @returns A score indicating how "good" a piece of information is to its requester.
     */
    evaluateGoodness(
        information: TInformation,
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<number>;

    getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>>;

    getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>>;
}

export interface IStoryTellerInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> extends RequireInfoType {
    getStoryTellerInformationOptions(
        context: TInfoProvideContext
    ): Promise<StoryTellerInformationOptions<TInformation>>;
}

export type IInfoProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> =
    | IInformationProvider<TInfoProvideContext, TInformation>
    | IStoryTellerInformationProvider<TInfoProvideContext, TInformation>;

export abstract class InfoProvider<_TInformation> {}

export abstract class InformationProvider<
        TInfoProvideContext extends InfoProvideContext,
        TInformation
    >
    extends InfoProvider<TInformation>
    implements IInformationProvider<TInfoProvideContext, TInformation>
{
    abstract readonly infoType: InfoType;

    abstract getTrueInformationOptions(
        context: TInfoProvideContext
    ): Promise<TrueInformationOptions<TInformation>>;

    abstract getFalseInformationOptions(
        context: TInfoProvideContext
    ): Promise<FalseInformationOptions<TInformation>>;

    async evaluateGoodness(
        _information: TInformation,
        _context: TInfoProvideContext,
        _evaluationContext?: LazyMap<string, any>
    ): Promise<number> {
        return await 0;
    }

    protected async buildEvaluationContext(
        context: TInfoProvideContext,
        evaluationContext?: LazyMap<string, any>
    ): Promise<LazyMap<string, any>> {
        evaluationContext ??= new LazyMap(() => undefined);

        return await this.buildEvaluationContextImpl(
            context,
            evaluationContext
        );
    }

    protected buildEvaluationContextImpl(
        _context: TInfoProvideContext,
        evaluationContext: LazyMap<string, any>
    ): Promise<LazyMap<string, any>> {
        return Promise.resolve(evaluationContext);
    }
}
