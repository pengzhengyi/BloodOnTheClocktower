import type {
    FalseInformationOptions,
    TrueInformationOptions,
} from '../information';
import type { StoryTellerInformationOptions } from '../storytellerinformation';
import type { CharacterSheet } from '~/game/charactersheet';
import type { Clocktower } from '~/game/clocktower';
import { LazyMap } from '~/game/collections';
import type { Player } from '~/game/player';
import type { Players } from '~/game/players';
import type { Seating } from '~/game/seating';
import type { StoryTeller } from '~/game/storyteller';
import type { TravellerSheet } from '~/game/travellersheet';

export interface InfoProvideContext {
    clocktower: Clocktower;
    characterSheet: CharacterSheet;
    travellerSheet: TravellerSheet;
    requestedPlayer: Player;
    players: Players;
    storyteller: StoryTeller;
    seating: Seating;
    reason?: string;
}

export interface IInformationProvider<
    TInfoProvideContext extends InfoProvideContext,
    TInformation
> {
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
> {
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
