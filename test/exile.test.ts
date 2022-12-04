import {
    GAME_UI,
    handleMock,
    hasRaisedHandForVoteMock,
} from '~/__mocks__/gameui';
jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));
import { Exile } from '~/game/exile';
import { ExileNonTraveller } from '~/game/exception';
import { Player } from '~/game/player';
import { Scapegoat } from '~/content/characters/output/scapegoat';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { createBasicPlayer, setPlayerDead } from '~/__mocks__/player';

async function collectVotesForExile(
    exile: Exile,
    playerToWillRaiseHand: Map<Player, boolean>
): Promise<Array<Player>> {
    const votedPlayers: Array<Player> = [];

    hasRaisedHandForVoteMock.mockImplementation(async (player: Player) => {
        return await playerToWillRaiseHand.get(player);
    });

    for await (const votedPlayer of exile.startVote(
        playerToWillRaiseHand.keys()
    )) {
        votedPlayers.push(votedPlayer);
    }

    return votedPlayers;
}

async function createExileAndCollectVotes(
    nominated: Player,
    nominator: Player,
    playersToVote: Array<Player>,
    willPlayerRaiseHand: Array<boolean>
): Promise<Array<Player>> {
    const exile = await Exile.init(nominator, nominated);

    const playerToWillRaiseHand = new Map<Player, boolean>();

    for (let i = 0; i < playersToVote.length; i++) {
        playerToWillRaiseHand.set(playersToVote[i], willPlayerRaiseHand[i]);
    }

    return await collectVotesForExile(exile, playerToWillRaiseHand);
}

describe('Test Exile Edge Cases', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('can only exile Traveller', async () => {
        const traveller = await createBasicPlayer(undefined, Scapegoat);
        const townsfolk = await createBasicPlayer(undefined, Washerwoman);

        handleMock.mockImplementation(async () => await false);

        await expect(
            async () => await Exile.init(traveller, townsfolk)
        ).rejects.toThrowError(ExileNonTraveller);
        expect(handleMock).toHaveBeenCalledOnce();

        const playersSupportExile = await createExileAndCollectVotes(
            traveller,
            townsfolk,
            [traveller, townsfolk],
            [false, true]
        );
        expect(playersSupportExile).toEqual([townsfolk]);
    });

    test('Any players may support an exile, even dead players without a vote token', async () => {
        const traveller = await createBasicPlayer(undefined, Scapegoat);
        const townsfolk = await createBasicPlayer(undefined, Washerwoman);

        await setPlayerDead(townsfolk);

        const playersSupportExile = await createExileAndCollectVotes(
            traveller,
            townsfolk,
            [traveller, townsfolk],
            [false, true]
        );
        expect(playersSupportExile).toEqual([townsfolk]);
    });
});
