import { mockButlerChooseMaster } from './common';
import { Butler } from '~/content/characters/output/butler';
import { Virgin } from '~/content/characters/output/virgin';
import { ButlerAbility } from '~/game/ability/butler';
import { DeadReason } from '~/game/dead-reason';
import type { GamePhase } from '~/game/game-phase';
import type { Action, ButlerPlayer } from '~/game/types';
import { mockAbilityUseContext } from '~/__mocks__/ability';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import { hasRaisedHandForVoteMock } from '~/__mocks__/game-ui';
import { createBasicPlayer } from '~/__mocks__/player';

describe('test ButlerAbility', () => {
    let butlerPlayer: ButlerPlayer;
    let butlerAbility: ButlerAbility;
    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(3);
    });

    afterAll(() => recoverGamePhase());

    beforeEach(async () => {
        butlerPlayer = await createBasicPlayer(undefined, Butler);
        butlerAbility = new ButlerAbility();
    });

    /**
     * {@link `butler["gameplay"][0]`}
     */
    test('The Butler chooses Filip to be their Master. Tomorrow, if Filip raises his hand to vote on an execution, then the Butler may too. If not, then the Butler may not raise their hand.', async () => {
        const Filip = await createBasicPlayer('Filip', Virgin);

        const context = mockAbilityUseContext(butlerPlayer);

        expect(await butlerAbility.isEligible(context)).toBeTrue();

        await mockButlerChooseMaster(butlerAbility, Filip, context);

        hasRaisedHandForVoteMock.mockResolvedValue(true);
        expect(await butlerPlayer.canVote).toBeTrue();
        hasRaisedHandForVoteMock.mockReset();

        hasRaisedHandForVoteMock.mockResolvedValue(false);
        expect(await butlerPlayer.canVote).toBeFalse();
        hasRaisedHandForVoteMock.mockReset();
    });

    /**
     * {@link `butler["gameplay"][1]`}
     */
    test('A nomination is in progress. The Butler and their Master both have their hands raised to vote. As the Storyteller is counting votes, the Master lowers their hand at the last second. The Butler must lower their hand immediately.', async () => {
        // TODO
    });

    /**
     * {@link `butler["gameplay"][2]`}
     */
    test('The Butler is dead. Because dead players have no ability, the Butler may vote with their vote token at any time.', async () => {
        const Filip = await createBasicPlayer('Filip', Virgin);

        await mockButlerChooseMaster(
            butlerAbility,
            Filip,
            undefined,
            butlerPlayer
        );

        await butlerPlayer.setDead(DeadReason.Other);
        expect(await butlerPlayer.canVote).toBeTrue();
    });
});
