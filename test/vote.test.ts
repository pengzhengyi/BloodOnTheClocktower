import {
    GAME_UI,
    hasRaisedHandForVoteMock,
    storytellerConfirmMock,
} from '~/__mocks__/gameui';
jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));
// eslint-disable-next-line import/order
import { playerFromDescription } from './utils';
import {
    createBasicPlayer,
    mockPlayer,
    setPlayerDead,
} from '~/__mocks__/player';

import { Player } from '~/game/player';
import { Vote } from '~/game/vote';

afterAll(() => {
    hasRaisedHandForVoteMock.mockReset();
    storytellerConfirmMock.mockReset();
});

async function collectVotesForExecution(
    vote: Vote,
    playerToWillRaiseHand: Map<Player, boolean>
): Promise<Array<Player>> {
    const votedPlayers: Array<Player> = [];

    hasRaisedHandForVoteMock.mockImplementation(async (player: Player) => {
        return await playerToWillRaiseHand.get(player);
    });

    for await (const votedPlayer of vote.collectVotes(
        playerToWillRaiseHand.keys()
    )) {
        votedPlayers.push(votedPlayer);
    }

    return votedPlayers;
}

async function createVoteAndCollectVotes(
    nominated: Player,
    forExile: boolean,
    playersToVote: Array<Player>,
    willPlayerRaiseHand: Array<boolean>
): Promise<Array<Player>> {
    const vote = new Vote(nominated, forExile);

    const playerToWillRaiseHand = new Map<Player, boolean>();

    for (let i = 0; i < playersToVote.length; i++) {
        playerToWillRaiseHand.set(playersToVote[i], willPlayerRaiseHand[i]);
    }

    return await collectVotesForExecution(vote, playerToWillRaiseHand);
}

describe('test Vote serialization', () => {
    test.concurrent('convert to object', async () => {
        const Evin = await playerFromDescription('Evin is the Chef');
        const Amy = await playerFromDescription('Amy is the Ravenkeeper');
        const vote = new Vote(Amy);
        vote.votes = [Evin];

        const voteObj = vote.toJSON();

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

        const votedPlayers = await createVoteAndCollectVotes(
            nominated1,
            false,
            [alivePlayer, deadPlayer],
            [true, true]
        );
        expect(votedPlayers).toEqual([alivePlayer, deadPlayer]);

        const votedPlayersSecondRound = await createVoteAndCollectVotes(
            nominated2,
            false,
            [alivePlayer, deadPlayer],
            [true, true]
        );
        expect(votedPlayersSecondRound).toEqual([alivePlayer]);
    });

    test('force recollection of votes', async () => {
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
        storytellerConfirmMock.mockImplementationOnce(async () => await false);
        const playersAtFirstTimeVoteReiterated = await collectVotesForExecution(
            vote,
            new Map([
                [player1, false],
                [player2, true],
            ])
        );
        expect(playersAtFirstTimeVoteReiterated).toEqual([player1, player2]);

        // revote approved
        storytellerConfirmMock.mockImplementationOnce(async () => await true);
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
