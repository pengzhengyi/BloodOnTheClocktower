import type { CharacterToken } from '../character';
import { CharacterNightEffect, Effect, InteractionContext } from '../effect';
import { FortuneTellerChooseInvalidPlayers } from '../exception';
import { CompositeGamePhaseKind } from '../gamephase';

import type { NextFunction } from '../middleware';
import type { NightSheet } from '../nightsheet';
import type { Player } from '../player';
import type { FortuneTellerPlayer } from '../types';
import type { FortuneTellerInformation } from '../info/provider/fortuneteller';
import {
    FortuneTellerInformationRequester,
    FortuneTellerInformationRequestContext,
} from '../info/requester/fortuneteller';
import {
    AbilitySetupContext,
    GetCharacterInformationAbility,
    GetInfoAbilityUseContext,
    RequireSetup,
} from './ability';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';
import { GAME_UI } from '~/interaction/gameui';
class BaseRedHerringEffect extends Effect<FortuneTellerPlayer> {
    static readonly description =
        'A good player that registers as a Demon to Fortune Teller';

    static readonly origin: CharacterToken = FortuneTeller;

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

    apply(
        context: InteractionContext<FortuneTellerPlayer>,
        next: NextFunction<InteractionContext<FortuneTellerPlayer>>
    ): InteractionContext<FortuneTellerPlayer> {
        const updatedContext = next(context);
        updatedContext.result = Promise.resolve(true);
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

    protected static canChoose(players: Array<Player> | undefined): boolean {
        return Array.isArray(players) && players.length === 2;
    }

    protected redHerringPlayer: Player | undefined;

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
        players: Iterable<Player>,
        context: GetInfoAbilityUseContext
    ): Promise<[Player, Player]> {
        let chosen = (await GAME_UI.choose(
            fortuneTellerPlayer,
            players,
            2,
            BaseGetFortuneTellerInformationAbility.description
        )) as Array<Player> | undefined;

        if (!BaseGetFortuneTellerInformationAbility.canChoose(chosen)) {
            const error = new FortuneTellerChooseInvalidPlayers(
                fortuneTellerPlayer,
                chosen,
                context
            );
            await error.resolve();
            chosen = error.corrected;
        }

        return chosen as [Player, Player];
    }

    protected async setupRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        players: Iterable<Player>,
        nightSheet: NightSheet
    ): Promise<void> {
        const redHerringPlayer = await this.chooseRedHerring(players);
        this.setRedHerring(fortuneTellerPlayer, redHerringPlayer, nightSheet);
    }

    protected async chooseRedHerring(
        players: Iterable<Player>
    ): Promise<Player> {
        return await GAME_UI.storytellerChooseOne(
            players,
            RedHerringEffect.description
        );
    }

    protected setRedHerring(
        fortuneTellerPlayer: FortuneTellerPlayer,
        redHerringPlayer: Player,
        nightSheet: NightSheet
    ) {
        this.redHerringPlayer = redHerringPlayer;
        const effect = new RedHerringEffect(fortuneTellerPlayer);
        effect.setup(nightSheet);
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
