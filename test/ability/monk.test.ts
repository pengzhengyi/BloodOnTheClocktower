import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from '../info-provider.test';
import { playerFromDescription } from '../utils';
import { monkProtectPlayer, expectAfterDemonAttack } from './common';
import { Monk } from '~/content/characters/output/monk';
import { MayorAbility } from '~/game/ability/mayor';
import { MonkProtectAbility } from '~/game/ability/monk';
import type { GamePhase } from '~/game/game-phase';
import { StoryTeller } from '~/game/storyteller';
import type { Action, ImpPlayer, MonkPlayer } from '~/game/types';
import {
    mockGetInfoAbilityUseContext,
    mockMayorAbilitySetupContext,
} from '~/__mocks__/ability';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import { mockClocktowerWithIsNonfirstNight } from '~/__mocks__/information';
import { getTroubleBrewingNightSheet } from '~/__mocks__/night-sheet';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test MonkProtectAbility', () => {
    let ability: MonkProtectAbility;
    let impPlayer: ImpPlayer;
    let monkPlayer: MonkPlayer;
    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(5);
    });

    afterAll(() => recoverGamePhase());

    beforeEach(async () => {
        ability = new MonkProtectAbility();
        impPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Imp`
        );
        monkPlayer = await createBasicPlayer(undefined, Monk);
    });

    /**
     * {@link `monk["gameplay"][0]`}
     */
    test('The Monk protects the Fortune Teller. The Imp attacks the Fortune Teller. No deaths occur tonight.', async () => {
        const fortuneTellerPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Fortune Teller`
        );

        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(monkPlayer, [
                    impPlayer,
                    fortuneTellerPlayer,
                ]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const _result = await monkProtectPlayer(
            ability,
            context,
            fortuneTellerPlayer
        );

        await expectAfterDemonAttack(fortuneTellerPlayer, impPlayer, false);
    });

    /**
     * {@link `monk["gameplay"][1]`}
     */
    test(`The Monk protects the Mayor, and the Imp attacks the Mayor. The Mayor's "another player dies" ability does not trigger, because the Mayor is safe from the Imp. Nobody dies tonight.`, async () => {
        const mayorPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Mayor`
        );
        const context = mockGetInfoAbilityUseContext(
            () =>
                createInfoProvideContext(monkPlayer, [impPlayer, mayorPlayer]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const mayorAbility = await MayorAbility.init(
            mockMayorAbilitySetupContext(
                mayorPlayer,
                context.players,
                undefined,
                await getTroubleBrewingNightSheet()
            )
        );
        expect(await mayorAbility.isEligible(context)).toBeTrue();

        const _result = await monkProtectPlayer(ability, context, mayorPlayer);

        await expectAfterDemonAttack(mayorPlayer, impPlayer, false);
        expect(await monkPlayer.alive).toBeTrue();
        expect(await impPlayer.alive).toBeTrue();
    });

    /**
     * {@link `monk["gameplay"][2]`}
     */
    test('The Monk protects the Imp . The Imp chooses to kill themself tonight, but nothing happens. The Imp stays alive and a new Imp is not created.', async () => {
        const context = mockGetInfoAbilityUseContext(
            () => createInfoProvideContext(monkPlayer, [impPlayer]),
            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );
        context.storyteller = new StoryTeller();

        const _result = await monkProtectPlayer(ability, context, impPlayer);

        await expectAfterDemonAttack(impPlayer, impPlayer, false);
    });
});
