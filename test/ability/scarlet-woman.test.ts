import { faker } from '@faker-js/faker';
import { createInfoProvideContextFromPlayerDescriptions } from '../info-provider.test';
import { Imp } from '~/content/characters/output/imp';
import { ScarletWoman } from '~/content/characters/output/scarletwoman';
import { ScarletWomanAbility } from '~/game/ability/scarlet-woman';
import { DeadReason } from '~/game/dead-reason';
import type { ImpPlayer, ScarletWomanPlayer } from '~/game/types';
import { mockAbilitySetupContext } from '~/__mocks__/ability';
import { mockClocktowerWithDay } from '~/__mocks__/information';
import { createBasicGame } from '~/__mocks__/game';
import { Alignment } from '~/game/alignment';

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

        mockClocktowerWithDay(infoProvideContext);

        const scarletWomanAbility = new ScarletWomanAbility();
        const scarletWomanPlayer =
            (await infoProvideContext.players.findByCharacter(
                ScarletWoman
            )) as ScarletWomanPlayer;
        const setupContext = mockAbilitySetupContext(
            scarletWomanPlayer,
            undefined,
            infoProvideContext
        );

        await scarletWomanAbility.setup(setupContext);

        const impPlayer = (await infoProvideContext.players.findByCharacter(
            Imp
        )) as ImpPlayer;
        const death = await impPlayer.setDead(DeadReason.Executed);
        expect(death.player.equals(impPlayer)).toBeTrue();
        expect(await impPlayer.dead).toBeTrue();

        const game = createBasicGame();
        const winningAlignment = await game.getWinningTeam(
            infoProvideContext.players
        );
        expect(winningAlignment).toBe(Alignment.Good);
    });
});
