import { faker } from '@faker-js/faker';
import {
    createInfoProvideContext,
    createSeatingAndPlayersFromDescriptions,
} from '../info-provider.test';
import { playerFromDescription } from '../utils';
import {
    expectAfterNominateVirgin,
    expectCharacterGetInformation,
    mockSpyRegisterAs,
} from './common';
import { Monk } from '~/content/characters/output/monk';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { GetWasherwomanInformationAbility } from '~/game/ability/washerwoman';
import { Townsfolk } from '~/game/character-type';
import {
    mockClocktowerForUndertaker,
    mockClocktowerWithIsFirstNight,
} from '~/__mocks__/information';
import { createBasicPlayer } from '~/__mocks__/player';
import { Chef } from '~/content/characters/output/chef';
import type { ChefPlayer, EmpathPlayer, SpyPlayer } from '~/game/types';
import { Spy } from '~/content/characters/output/spy';
import { GetChefInformationAbility } from '~/game/ability/chef';
import { Empath } from '~/content/characters/output/empath';
import { GetEmpathInformationAbility } from '~/game/ability/empath';
import { Virgin } from '~/content/characters/output/virgin';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Drunk } from '~/content/characters/output/drunk';
import { GetUndertakerInformationAbility } from '~/game/ability/undertaker';
import {
    mockStorytellerChooseMatchingOne,
    storytellerChooseOneMock,
} from '~/__mocks__/game-ui';
import type { ChefInformation } from '~/game/info/provider/chef';
import type { Information } from '~/game/info/information';

describe('test SpyAbility', () => {
    /**
     * {@link `spy["gameplay"][0]`}
     */
    test('The Washerwoman learns that either Abdallah or Douglas is the Ravenkeeper. Abdallah is the Monk, and Douglas is the Spy registering as the Ravenkeeper.', async () => {
        const washerwomanPlayer = await createBasicPlayer(
            undefined,
            Washerwoman
        );

        const Abdallah = await playerFromDescription('Abdallah is the Monk,');

        const Douglas = await playerFromDescription('Douglas is the Spy');

        const washerwomanAbility = new GetWasherwomanInformationAbility();

        const info = await mockSpyRegisterAs(
            Douglas,
            () =>
                expectCharacterGetInformation(
                    washerwomanAbility,
                    () =>
                        createInfoProvideContext(washerwomanPlayer, [
                            Douglas,
                            Abdallah,
                        ]),
                    [(context) => mockClocktowerWithIsFirstNight(context, true)]
                ),
            Ravenkeeper
        );

        expect(info.characterType).toBe(Townsfolk);
        expect(info.players).toIncludeSameMembers([Douglas, Abdallah]);
        expect(info.character).toBeOneOf([Ravenkeeper, Monk]);
    });

    /**
     * {@link `spy["gameplay"][1]`}
     */
    test('The Spy neighbours the Imp and the Empath. The Chef learns a "1" because the Spy is registering as evil. Later that night, the Empath learns a "0" because the Spy is now registering as good.', async () => {
        const [seating, players] =
            await createSeatingAndPlayersFromDescriptions(
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Spy`,
                `${faker.name.firstName()} is the Empath`,
                `${faker.name.firstName()} is the Chef`
            );

        const chefPlayer = players.find(
            (player) => player.storytellerGet('_character') === Chef
        ) as ChefPlayer;
        const spyPlayer = players.find(
            (player) => player.storytellerGet('_character') === Spy
        ) as SpyPlayer;
        const empathPlayer = players.find(
            (player) => player.storytellerGet('_character') === Empath
        ) as EmpathPlayer;

        mockStorytellerChooseMatchingOne(
            (information: Information<ChefInformation>) =>
                information.info.numPairEvilPlayers === 1,
            1
        );

        const chefAbility = new GetChefInformationAbility();
        const chefInfo = await expectCharacterGetInformation(
            chefAbility,
            () =>
                createInfoProvideContext(
                    chefPlayer,
                    players.filter((player) => !player.equals(chefPlayer))
                ),
            [
                (context) => {
                    context.seating = seating;
                },
                (context) => mockClocktowerWithIsFirstNight(context, true),
            ]
        );

        storytellerChooseOneMock.mockReset();

        expect(chefInfo.numPairEvilPlayers).toBe(1);

        const empathAbility = new GetEmpathInformationAbility();
        const empathInfo = await mockSpyRegisterAs(
            spyPlayer,
            () =>
                expectCharacterGetInformation(
                    empathAbility,
                    () =>
                        createInfoProvideContext(
                            empathPlayer,
                            players.filter(
                                (player) => !player.equals(empathPlayer)
                            )
                        ),
                    [
                        (context) => {
                            context.seating = seating;
                        },
                        (context) =>
                            mockClocktowerWithIsFirstNight(context, true),
                    ]
                ),
            Washerwoman
        );
        expect(empathInfo.numEvilAliveNeighbors).toBe(0);
    });

    /**
     * {@link `spy["gameplay"][2]`}
     */
    test('The Spy nominates the Virgin and is executed by the Virgin’s ability, because the Storyteller chooses that the Spy registers as a Townsfolk. That night, the Undertaker learns that the Drunk died today, because the Spy is now registering as the Drunk.', async () => {
        const spyPlayer = await createBasicPlayer(undefined, Spy);
        const virginPlayer = await createBasicPlayer(undefined, Virgin);
        const undertakerPlayer = await createBasicPlayer(undefined, Undertaker);

        await mockSpyRegisterAs(
            spyPlayer,
            () => expectAfterNominateVirgin(spyPlayer, virginPlayer),
            Washerwoman
        );

        const undertakerAbility = new GetUndertakerInformationAbility();
        const undertakerInfo = await mockSpyRegisterAs(
            spyPlayer,
            () =>
                expectCharacterGetInformation(
                    undertakerAbility,
                    () =>
                        createInfoProvideContext(undertakerPlayer, [
                            spyPlayer,
                            virginPlayer,
                        ]),
                    [
                        (context) =>
                            mockClocktowerForUndertaker(
                                context,
                                true,
                                spyPlayer
                            ),
                    ]
                ),
            Drunk
        );

        expect(undertakerInfo.character).toBe(Drunk);
        expect(undertakerInfo.executedPlayer).toBe(spyPlayer);
    });
});
