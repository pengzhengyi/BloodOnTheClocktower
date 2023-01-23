import { faker } from '@faker-js/faker';
import { playerFromDescription } from '../utils';
import { AbilityUseStatus } from '~/game/ability/status';
import { VirginAbility, VirginAbilityUseContext } from '~/game/ability/virgin';
import { DeadReason } from '~/game/dead-reason';
import { DeadPlayerCannotNominate } from '~/game/exception';
import { Execution } from '~/game/execution';
import type { GamePhase } from '~/game/game-phase';
import type { Action, VirginPlayer } from '~/game/types';
import { mockVirginAbilityUseContext } from '~/__mocks__/ability';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import { handleMock, storytellerConfirmMock } from '~/__mocks__/game-ui';
import type { IPlayer } from '~/game/player';

async function expectAfterNominateVirgin(
    nominator: IPlayer,
    virginPlayer: VirginPlayer,
    execution?: Execution,
    ability?: VirginAbility,
    context?: VirginAbilityUseContext,
    expectDead = true,
    expectHasAbility = false
) {
    execution ??= Execution.init();
    ability ??= new VirginAbility();
    context ??= mockVirginAbilityUseContext(virginPlayer, execution);

    expect(await ability.isEligible(context)).toBeTrue();
    const result = await ability.use(context);

    expect(result.status).toEqual(
        AbilityUseStatus.Success | AbilityUseStatus.HasEffect
    );

    if (expectDead) {
        storytellerConfirmMock.mockResolvedValue(true);
    }

    const nomination = await nominator.nominate(virginPlayer, execution);

    if (expectHasAbility) {
        expect(nomination).toBeUndefined();
    } else {
        expect(nomination).toBeDefined();
    }

    if (expectDead) {
        expect(await nominator.dead).toBeTrue();
        storytellerConfirmMock.mockReset();
    } else {
        expect(await nominator.dead).toBeFalse();
    }

    if (expectHasAbility) {
        expect(await ability.isEligible(context)).toBeTrue();
    } else {
        expect(await ability.isEligible(context)).toBeFalse();
    }
}

describe('test VirginAbility', () => {
    let virginPlayer: VirginPlayer;

    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(3);
    });

    afterAll(() => recoverGamePhase());

    beforeEach(async () => {
        virginPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Virgin`
        );
    });

    /**
     * {@link `virgin["gameplay"][0]`}
     */
    test('The Washerwoman nominates the Virgin. The Washerwoman is immediately executed and the day ends.', async () => {
        const washerwomanPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Washerwoman`
        );
        expect(await washerwomanPlayer.alive).toBeTrue();

        await expectAfterNominateVirgin(washerwomanPlayer, virginPlayer);
    });

    /**
     * {@link `virgin["gameplay"][1]`}
     */
    test('The Drunk, who thinks they are the Chef, nominates the Virgin. The Drunk remains alive, and the Virgin loses their ability. Players may now vote on whether or not to execute the Virgin. (This happens because the Drunk is not a Townsfolk.)', async () => {
        const drunkPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Drunk`
        );

        expect(await drunkPlayer.alive).toBeTrue();

        await expectAfterNominateVirgin(
            drunkPlayer,
            virginPlayer,
            undefined,
            undefined,
            undefined,
            false
        );
    });

    /**
     * {@link `virgin["gameplay"][2]`}
     */
    test('A dead player nominates the Virgin. The dead, however, cannot nominate. The Storyteller declares that the nomination does not count. The Virgin does not lose their ability.', async () => {
        const librarianPlayer = await playerFromDescription(
            `${faker.name.firstName()} is the Librarian`
        );
        await librarianPlayer.setDead(DeadReason.DemonAttack);
        expect(await librarianPlayer.dead).toBeTrue();

        handleMock.mockImplementation((error) => {
            expect(error).toBeInstanceOf(DeadPlayerCannotNominate);
            return Promise.resolve(true);
        });

        expectAfterNominateVirgin(
            librarianPlayer,
            virginPlayer,
            undefined,
            undefined,
            undefined,
            true,
            true
        );

        handleMock.mockReset();
    });
});
