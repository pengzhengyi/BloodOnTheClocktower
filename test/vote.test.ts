import { playerFromDescription } from './utils';
import { Vote } from '~/game/vote';

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
