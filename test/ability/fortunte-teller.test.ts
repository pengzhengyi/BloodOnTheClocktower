import { faker } from '@faker-js/faker';
import { createInfoProvideContext } from '../info/info-provider.test';
import { playerFromDescription } from '../utils';
import { expectCharacterGetInformation } from './common';
import { Generator } from '~/game/collections';
import {
    RedHerringEffect,
    GetFortuneTellerInformationAbility,
} from '~/game/ability/fortuneteller';
import type { IPlayer } from '~/game/player/player';
import { mockAbilitySetupContext } from '~/__mocks__/ability';
import {
    storytellerChooseOneMock,
    chooseMock,
    mockChooseImplementation,
    mockStorytellerChooseOne,
} from '~/__mocks__/game-ui';
import { mockClocktowerWithIsFirstNight } from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';
import { Saint, FortuneTeller } from '~/__mocks__/character';

describe('test GetFortuneTellerInformationAbility', () => {
    beforeAll(() => {
        mockStorytellerChooseOne<unknown>(async (options, reason) => {
            if (reason === RedHerringEffect.description) {
                const players = options as Iterable<IPlayer>;
                const saintPlayerCandidates = await Generator.filterAllAsync(
                    async (player) => (await player.character) === Saint,
                    players
                );
                const saintPlayer = Generator.take(1, saintPlayerCandidates);
                expect(saintPlayer).toBeDefined();
                return saintPlayer;
            }

            return Generator.take(1, options);
        });

        mockChooseImplementation(async (fortuneTellerPlayer, players) => {
            expect(await fortuneTellerPlayer.character).toEqual(FortuneTeller);
            return Generator.take(2, players);
        });
    });

    afterAll(() => {
        storytellerChooseOneMock.mockReset();
        chooseMock.mockReset();
    });

    /**
     * {@link `fortuneteller["gameplay"][3]`}
     */
    test("The Fortune Teller chooses themselves and a Saint. The Saint is the Red Herring. The Fortune Teller learns a 'yes'.", async () => {
        const saintPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Saint`
        );
        const fortuneTellerPlayer = await createBasicPlayer(
            undefined,
            FortuneTeller
        );

        const info = await expectCharacterGetInformation(
            undefined,
            () => createInfoProvideContext(fortuneTellerPlayer, [saintPlayer]),
            [(context) => mockClocktowerWithIsFirstNight(context, true)],
            async (context) =>
                await GetFortuneTellerInformationAbility.init(
                    mockAbilitySetupContext(undefined, undefined, context)
                )
        );

        expect(info.hasDemon).toBeTrue();
        expect(info.chosenPlayers).toIncludeSameMembers([
            saintPlayer,
            fortuneTellerPlayer,
        ]);
    });
});
