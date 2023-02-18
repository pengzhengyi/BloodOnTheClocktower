import { faker } from '@faker-js/faker';
import { createInfoProvideContextFromPlayerDescriptions } from '../info-provider.test';
import {
    expectCharacterGetInformation,
    expectScarletWomanBecomeDemonAfterDemonDeath,
} from './common';
import { ScarletWomanAbility } from '~/game/ability/scarlet-woman';
import { DeadReason } from '~/game/dead-reason';
import { mockAbilitySetupContext } from '~/__mocks__/ability';
import {
    mockClocktowerWithIsFirstNight,
    mockClocktowerWithIsNonfirstNight,
} from '~/__mocks__/information';
import { createBasicGame } from '~/__mocks__/game';
import { Alignment } from '~/game/alignment';
import { GetFortuneTellerInformationAbility } from '~/game/ability/fortuneteller';
import {
    chooseMock,
    mockChoose,
    mockStorytellerChooseFirstOne,
    mockStorytellerChooseMatchingOne,
    storytellerChooseOneMock,
} from '~/__mocks__/game-ui';
import { type IPlayer } from '~/game/player';
import {
    ScarletWoman,
    Imp,
    FortuneTeller,
    Washerwoman,
    Virgin,
} from '~/__mocks__/character';

describe('test ScarletWomanAbility', () => {
    /**
     * {@link `scarletwoman["gameplay"][0]`}
     */
    test('There are seven players alive: the Imp, the Scarlet Woman, two Townsfolk, and three Travellers. The Imp is executed, so the game ends and good wins.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === ScarletWoman,
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Washerwoman`,
                `${faker.name.firstName()} is the ScarletWoman`,
                `${faker.name.firstName()} is the Virgin`,
                `${faker.name.firstName()} is the evil Scapegoat`,
                `${faker.name.firstName()} is the good Gunslinger`,
                `${faker.name.firstName()} is the evil Beggar`
            );

        const scarletWomanAbility = new ScarletWomanAbility();
        const scarletWomanPlayer =
            (await infoProvideContext.players.findByCharacter(
                ScarletWoman
            )) as IPlayer;
        const setupContext = mockAbilitySetupContext(
            scarletWomanPlayer,
            undefined,
            infoProvideContext
        );

        await scarletWomanAbility.setup(setupContext);

        const impPlayer = (await infoProvideContext.players.findByCharacter(
            Imp
        )) as IPlayer;
        const _death = await impPlayer.setDead(DeadReason.Executed);

        expect(await impPlayer.dead).toBeTrue();

        const game = await createBasicGame(undefined, {
            initialPlayers: Array.from(infoProvideContext.players),
        });
        const winningAlignment = await game.getWinningTeam(
            infoProvideContext.players
        );
        expect(winningAlignment).toBe(Alignment.Good);
    });

    /**
     * {@link `scarletwoman["gameplay"][1]`}
     */
    test('There are five players alive: the Imp, the Scarlet Woman, the Baron, and two Townsfolk. The Imp is executed. The Scarlet Woman becomes the Imp, and the game continues.', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === ScarletWoman,
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Washerwoman`,
                `${faker.name.firstName()} is the ScarletWoman`,
                `${faker.name.firstName()} is the Virgin`,
                `${faker.name.firstName()} is the Baron`
            );

        const scarletWomanPlayer =
            (await infoProvideContext.players.findByCharacter(
                ScarletWoman
            )) as IPlayer;

        const impPlayer = (await infoProvideContext.players.findByCharacter(
            Imp
        )) as IPlayer;
        await expectScarletWomanBecomeDemonAfterDemonDeath(
            scarletWomanPlayer,
            impPlayer,
            undefined,
            undefined,
            infoProvideContext.players,
            DeadReason.Executed,
            true
        );
    });

    /**
     * {@link `scarletwoman["gameplay"][2]`}
     */
    test('Brianna is the Scarlet Woman. The Fortune Teller chooses Brianna and Alex, and learns a "no.” Later, the Imp dies, so Brianna becomes the Imp. The Fortune Teller chooses Brianna and Alex again, and learns a "yes.”', async () => {
        const infoProvideContext =
            await createInfoProvideContextFromPlayerDescriptions(
                async (player) => (await player.character) === ScarletWoman,
                `${faker.name.firstName()} is the Imp`,
                `${faker.name.firstName()} is the Washerwoman`,
                `Brianna is the ScarletWoman`,
                `Alex is the Virgin`,
                `${faker.name.firstName()} is the Fortune Teller`
            );

        const scarletWomanPlayer =
            (await infoProvideContext.players.findByCharacter(
                ScarletWoman
            )) as IPlayer;

        const fortuneTellerPlayer =
            (await infoProvideContext.players.findByCharacter(
                FortuneTeller
            )) as IPlayer;
        infoProvideContext.requestedPlayer = fortuneTellerPlayer;

        mockStorytellerChooseMatchingOne<IPlayer>(
            (player) => player.storytellerGet('_character') === Washerwoman
        );
        const fortuneTellerAbility =
            await GetFortuneTellerInformationAbility.init(
                mockAbilitySetupContext(
                    fortuneTellerPlayer,
                    undefined,
                    infoProvideContext
                )
            );
        storytellerChooseOneMock.mockReset();

        const virginPlayer = (await infoProvideContext.players.findByCharacter(
            Virgin
        )) as IPlayer;
        mockChoose([scarletWomanPlayer, virginPlayer]);
        mockStorytellerChooseFirstOne();
        const fortuneTellerFirstNightInfo = await expectCharacterGetInformation(
            fortuneTellerAbility,
            () => infoProvideContext,

            [(context) => mockClocktowerWithIsFirstNight(context, true)]
        );
        storytellerChooseOneMock.mockReset();

        expect(fortuneTellerFirstNightInfo.hasDemon).toBeFalse();

        const impPlayer = (await infoProvideContext.players.findByCharacter(
            Imp
        )) as IPlayer;

        await expectScarletWomanBecomeDemonAfterDemonDeath(
            scarletWomanPlayer,
            impPlayer,
            undefined,
            undefined,
            infoProvideContext.players,
            undefined,
            true
        );

        mockStorytellerChooseFirstOne();
        const fortuneTellerLaterNightInfo = await expectCharacterGetInformation(
            fortuneTellerAbility,
            () => infoProvideContext,

            [(context) => mockClocktowerWithIsNonfirstNight(context, true)]
        );

        expect(fortuneTellerLaterNightInfo.hasDemon).toBeTrue();

        chooseMock.mockReset();
        storytellerChooseOneMock.mockReset();
    });
});
