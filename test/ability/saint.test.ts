import { createExecutionAndAddVotedNominations } from '../execution.test';
import { expectAfterExecuteSaint } from './common';
import type { GamePhase } from '~/game/game-phase';
import type { Action } from '~/game/types';

import { mockGamePhaseTemporarily } from '~/__mocks__/effects';
import { mockPlayers } from '~/__mocks__/players';
import {
    Saint,
    Baron,
    Imp,
    Librarian,
    Investigator,
    Monk,
    Recluse,
} from '~/__mocks__/character';

describe('test SaintAbility', () => {
    let _gamePhase: GamePhase | undefined;
    let recoverGamePhase: Action;

    beforeAll(() => {
        [_gamePhase, recoverGamePhase] = mockGamePhaseTemporarily(3);
    });

    afterAll(() => recoverGamePhase());

    /**
     * {@link `saint["gameplay"][0]`}
     */
    test('There are seven players alive and nominations are in progress. The Saint gets four votes and is about to die. Then, the Baron is nominated but only gets three votes. No more nominations occur today. The Saint is executed, and evil wins.', async () => {
        const [players, _players] = await mockPlayers([
            Saint,
            Baron,
            Imp,
            Librarian,
            Investigator,
            Recluse,
            Monk,
        ]);
        const saintPlayer = _players[0];

        const execution = await createExecutionAndAddVotedNominations(
            [
                [_players[1], _players[0]], // baron nominates saint
                [_players[0], _players[1]], // saint nominates baron
            ],
            [
                new Map([
                    [_players[1], true],
                    [_players[2], true],
                    [_players[3], true],
                    [_players[4], true],
                ]),
                new Map([
                    [_players[0], true],
                    [_players[5], true],
                    [_players[6], true],
                ]),
            ]
        );

        await expectAfterExecuteSaint(
            execution,
            saintPlayer,
            true,
            undefined,
            players
        );
    });

    /**
     * {@link `saint["gameplay"][1]`}
     */
    test('The Imp is nominated, and the players vote. The Gunslinger kills the Saint. The Saint dies, and the game continues.', async () => {
        // TODO
    });

    /**
     * {@link `saint["gameplay"][2]`}
     */
    test("The Saint is executed. However, the Scapegoat's ability is triggered, so the Scapegoat dies instead. The game continues, because the Saint did not die.", async () => {
        // TODO
    });
});
