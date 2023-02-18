import { Effect, type InteractionContext } from '../effect/effect';
import { FortuneTellerChooseInvalidPlayers } from '../exception/fortune-teller-choose-invalid-players';
import { CompositeGamePhaseKind } from '../game-phase-kind';

import type { FortuneTellerInformation } from '../info/provider/fortuneteller';
import {
    type FortuneTellerInformationRequestContext,
    FortuneTellerInformationRequester,
} from '../info/requester/fortuneteller';
import type { NextFunction } from '../proxy/middleware';
import type { NightSheet } from '../night-sheet';
import type { IPlayer, IPlayer as FortuneTellerPlayer } from '../player';
import { CharacterNightEffect } from '../effect/character';
import type { CharacterId } from '../character/character-id';
import { CharacterIds } from '../character/character-id';
import {
    type AbilitySetupContext,
    GetCharacterInformationAbility,
    type GetInfoAbilityUseContext,
    RequireSetup,
} from './ability';
class BaseRedHerringEffect extends Effect<FortuneTellerPlayer> {
    static readonly description =
        'A good player that registers as a Demon to Fortune Teller';

    static readonly origin: CharacterId = CharacterIds.FortuneTeller;

    constructor(protected readonly fortuneTellerPlayer: FortuneTellerPlayer) {
        super();
    }

    isApplicable(context: InteractionContext<FortuneTellerPlayer>): boolean {
        return (
            super.isApplicable(context) &&
            this.isGetProperty(context, 'isDemon') &&
            this.matchNotNullInitiator<FortuneTellerPlayer>(
                context,
                (initiator) => this.fortuneTellerPlayer.equals(initiator)
            )
        );
    }

    protected applyCooperativelyImpl(
        context: InteractionContext<FortuneTellerPlayer>,
        next: NextFunction<InteractionContext<FortuneTellerPlayer>>
    ): InteractionContext<FortuneTellerPlayer> {
        context.result = Promise.resolve(true);
        const updatedContext = next(context);
        return updatedContext;
    }
}

export const RedHerringEffect = CharacterNightEffect(BaseRedHerringEffect);

class BaseGetFortuneTellerInformationAbility extends GetCharacterInformationAbility<
    FortuneTellerInformation,
    FortuneTellerInformationRequester<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    >
> {
    /**
     * {@link `fortuneteller["ability"]`}
     */
    static readonly description =
        'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.';

    protected static canChoose(players: Array<IPlayer> | undefined): boolean {
        return Array.isArray(players) && players.length === 2;
    }

    protected redHerringPlayer: IPlayer | undefined;

    protected infoRequester = new FortuneTellerInformationRequester<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    >();

    async setup(context: AbilitySetupContext): Promise<void> {
        await super.setup(context);
        this.setupRedHerring(
            context.requestedPlayer,
            context.players,
            context.nightSheet
        );
    }

    protected async createRequestContext(
        context: GetInfoAbilityUseContext
    ): Promise<
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
    > {
        const infoRequestContext = (await super.createRequestContext(
            context
        )) as Omit<
            FortuneTellerInformationRequestContext<FortuneTellerInformation>,
            'chosenPlayers'
        >;
        const chosenPlayers = await this.choosePlayers(
            context.requestedPlayer,
            context.players,
            context
        );
        (
            infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>
        ).chosenPlayers = chosenPlayers;
        return infoRequestContext as FortuneTellerInformationRequestContext<FortuneTellerInformation>;
    }

    protected async choosePlayers(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<IPlayer>,
        context: GetInfoAbilityUseContext
    ): Promise<[IPlayer, IPlayer]> {
        let chosenPlayers = await this.chooseTwoPlayers(
            fortuneTellerPlayer,
            players,
            BaseGetFortuneTellerInformationAbility.description
        );

        if (!BaseGetFortuneTellerInformationAbility.canChoose(chosenPlayers)) {
            const error = new FortuneTellerChooseInvalidPlayers(
                fortuneTellerPlayer,
                chosenPlayers,
                context
            );
            await error.resolve();
            chosenPlayers = error.corrected;
        }

        return chosenPlayers;
    }

    protected async setupRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<IPlayer>,
        nightSheet: NightSheet
    ): Promise<void> {
        const redHerringPlayer = await this.chooseRedHerring(players);
        this.setRedHerring(fortuneTellerPlayer, redHerringPlayer, nightSheet);
    }

    protected async chooseRedHerring(
        players: Iterable<IPlayer>
    ): Promise<IPlayer> {
        return await this.storytellerChooseOne(
            players,
            RedHerringEffect.description
        );
    }

    protected setRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        redHerringPlayer: IPlayer,
        nightSheet: NightSheet
    ) {
        this.redHerringPlayer = redHerringPlayer;
        const effect = new RedHerringEffect(fortuneTellerPlayer);
        effect.setupPriority(nightSheet);
        redHerringPlayer.effects.add(effect, CompositeGamePhaseKind.EveryNight);
    }
}

export interface GetFortuneTellerInformationAbility
    extends GetCharacterInformationAbility<
        FortuneTellerInformation,
        FortuneTellerInformationRequester<
            FortuneTellerInformationRequestContext<FortuneTellerInformation>
        >
    > {}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GetFortuneTellerInformationAbility = RequireSetup(
    BaseGetFortuneTellerInformationAbility
);
