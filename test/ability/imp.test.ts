import { expectAfterImpKill, expectAfterImpSelfKill } from './common';
import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import { mockPlayers } from '~/__mocks__/players';
import {
    Imp,
    Poisoner,
    Washerwoman,
    Virgin,
    Mayor,
} from '~/__mocks__/character';

describe('test ImpAbility', () => {
    /**
     * {@link `imp["gameplay"][0]`}
     */
    test('It is the first night. The Imp learns that Evin and Sarah are the Minions. The Imp also learns that the Monk, Chef, and Librarian are not in play. The Imp bluffs as the Chef, then bluffs as Mayor halfway through the game. Eventually, the Imp is executed and good wins.', async () => {
        // TODO
    });

    /**
     * {@link `imp["gameplay"][1]`}
     */
    test('During the night, the Imp wakes and chooses a player, who dies. The next night, the Imp chooses themselves to die. The Imp dies, and the Poisoner becomes the Imp.', async () => {
        const [players, _players] = await mockPlayers([
            Imp,
            Poisoner,
            Washerwoman,
            Virgin,
            Mayor,
        ]);
        const impPlayer = _players[0];
        const washerwomanPlayer = _players[2];
        const poisonerPlayer = _players[1];

        let [_gamePhase, recover] = mockGamePhaseTemporarily(5);
        const washerwomanDeath = await expectAfterImpKill(
            washerwomanPlayer,
            impPlayer,
            undefined,
            undefined,
            undefined,
            players
        );
        recover();
        expect(washerwomanDeath?.isFor(washerwomanPlayer)).toBeTrue();

        [_gamePhase, recover] = mockGamePhaseTemporarily(9);
        const _impDeath = await expectAfterImpSelfKill(
            impPlayer,
            poisonerPlayer,
            undefined,
            undefined,
            undefined,
            players
        );
        recover();
    });
});
