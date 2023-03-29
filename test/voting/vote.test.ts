import { playerFromDescription } from '../utils';
import {
    hasRaisedHandForVoteMock,
    storytellerConfirmMock,
} from '~/__mocks__/game-ui';
import {
    createBasicPlayer,
    mockPlayer,
    setPlayerDead,
} from '~/__mocks__/player';

import type { IPlayer } from '~/game/player';
import type { IVote } from '~/game/voting/vote';
import { Vote } from '~/game/voting/vote';

afterAll(() => {
    hasRaisedHandForVoteMock.mockReset();
    storytellerConfirmMock.mockReset();
});

async function collectVotesForExecution(
    vote: Vote,
    playerToWillRaiseHand: Map<IPlayer, boolean>
): Promise<Array<IPlayer>> {
    const votedPlayers: Array<IPlayer> = [];

    hasRaisedHandForVoteMock.mockImplementation((player: IPlayer) => {
        return Promise.resolve(playerToWillRaiseHand.get(player));
    });

    for await (const votedPlayer of vote.collectVotes(
        playerToWillRaiseHand.keys()
    )) {
        votedPlayers.push(votedPlayer);
    }

    return votedPlayers;
}

async function createVoteAndCollectVotes(
    nominated: IPlayer,
    forExile: boolean,
    playersToVote: Array<IPlayer>,
    willPlayerRaiseHand: Array<boolean>
): Promise<[IVote, Array<IPlayer>]> {
    const vote = new Vote(nominated, forExile);

    const playerToWillRaiseHand = new Map<IPlayer, boolean>();

    for (let i = 0; i < playersToVote.length; i++) {
        playerToWillRaiseHand.set(playersToVote[i], willPlayerRaiseHand[i]);
    }

    const votedPlayers = await collectVotesForExecution(
        vote,
        playerToWillRaiseHand
    );

    return [vote, votedPlayers];
}

describe('test Vote serialization', () => {
    test.concurrent('convert to object', async () => {
        const Evin = await playerFromDescription('Evin is the Chef');
        const Amy = await playerFromDescription('Amy is the Ravenkeeper');
        const [vote, _] = await createVoteAndCollectVotes(
            Amy,
            false,
            [Evin],
            [true]
        );

        const voteObj = vote.toJSON() as Record<string, any>;

        expect(Amy.equals(voteObj.nominated)).toBeTrue();
        expect(voteObj.votes).toHaveLength(1);
        expect(Evin.equals(voteObj.votes[0])).toBeTrue();
    });
});

describe('Test Vote Edge Cases', () => {
    test('A dead player may only vote once for the rest of the game.', async () => {
        const nominated1 = mockPlayer();
        const nominated2 = mockPlayer();
        const alivePlayer = await createBasicPlayer();
        const deadPlayer = await createBasicPlayer();
        await setPlayerDead(deadPlayer);

        const [_vote1, votedPlayers] = await createVoteAndCollectVotes(
            nominated1,
            false,
            [alivePlayer, deadPlayer],
            [true, true]
        );
        expect(votedPlayers).toEqual([alivePlayer, deadPlayer]);

        const [_vote2, votedPlayersSecondRound] =
            await createVoteAndCollectVotes(
                nominated2,
                false,
                [alivePlayer, deadPlayer],
                [true, true]
            );
        expect(votedPlayersSecondRound).toEqual([alivePlayer]);
    });

    // skip due to recollection is not supported
    test.skip('force recollection of votes', async () => {
        const nominated = mockPlayer();
        const player1 = await createBasicPlayer();
        const player2 = await createBasicPlayer();

        const vote = new Vote(nominated, false);
        const playersAtFirstTimeVote = await collectVotesForExecution(
            vote,
            new Map([
                [player1, true],
                [player2, true],
            ])
        );
        expect(playersAtFirstTimeVote).toEqual([player1, player2]);

        // revote denied
        storytellerConfirmMock.mockImplementationOnce(() =>
            Promise.resolve(false)
        );
        const playersAtFirstTimeVoteReiterated = await collectVotesForExecution(
            vote,
            new Map([
                [player1, false],
                [player2, true],
            ])
        );
        expect(playersAtFirstTimeVoteReiterated).toEqual([player1, player2]);

        // revote approved
        storytellerConfirmMock.mockImplementationOnce(() =>
            Promise.resolve(true)
        );
        const playersAtReVote = await collectVotesForExecution(
            vote,
            new Map([
                [player1, false],
                [player2, true],
            ])
        );

        expect(playersAtReVote).toEqual([player2]);
    });
});