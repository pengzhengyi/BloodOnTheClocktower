import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import { GameHasTooFewPlayers, GameHasTooManyPlayers } from '~/game/exception';
import { SetupSheet } from '~/game/setup-sheet';
import { storytellerChooseOneMock } from '~/__mocks__/game-ui';

describe('Test validateNumberOfPlayers', () => {
    test.concurrent('3 players', () => {
        expect(() => SetupSheet.validateNumberOfPlayers(3, true)).toThrowError(
            GameHasTooFewPlayers
        );
        expect(() => SetupSheet.validateNumberOfPlayers(3, false)).toThrowError(
            GameHasTooFewPlayers
        );
    });

    test.concurrent('5 players', () => {
        SetupSheet.validateNumberOfPlayers(5, true);
        expect(() => SetupSheet.validateNumberOfPlayers(5, false)).toThrowError(
            GameHasTooFewPlayers
        );
    });

    test.concurrent('7 players', () => {
        SetupSheet.validateNumberOfPlayers(7, true);
        SetupSheet.validateNumberOfPlayers(7, false);
    });

    test.concurrent('15 players', () => {
        SetupSheet.validateNumberOfPlayers(15, true);
        SetupSheet.validateNumberOfPlayers(15, false);
    });

    test.concurrent('21 players', () => {
        expect(() => SetupSheet.validateNumberOfPlayers(21, true)).toThrowError(
            GameHasTooManyPlayers
        );
        expect(() =>
            SetupSheet.validateNumberOfPlayers(21, false)
        ).toThrowError(GameHasTooManyPlayers);
    });
});

test.concurrent('validate recommended assignments', () => {
    for (const [numPlayers, assignment] of SetupSheet.RECOMMENDED_ASSIGNMENTS) {
        const assignedNumPlayers = Object.values(assignment).reduce(
            (numPlayersForCharacterType, numPlayersForOtherCharacterType) =>
                numPlayersForCharacterType + numPlayersForOtherCharacterType
        );
        expect(numPlayers).toEqual(assignedNumPlayers);
    }
});

describe('test recommend assignments', () => {
    test('recommend non-traveller setup', () => {
        expect(SetupSheet.recommend(12)).toEqual({
            townsfolk: 7,
            outsider: 2,
            minion: 2,
            demon: 1,
            traveller: 0,
        });
    });

    test('recommend traveller setup', () => {
        const assignments = Array.from(
            SetupSheet.recommendWithOptionalTraveller(13, 3)
        );

        expect(assignments).toHaveLength(3 + 1);

        for (const assignment of assignments) {
            const numTraveller = assignment.traveller;

            const expectedAssignment = SetupSheet.recommend(13 - numTraveller);
            expectedAssignment.traveller = numTraveller;

            expect(assignment).toEqual(expectedAssignment);
        }
    });
});

describe('test setup edition', () => {
    test('setup edition', async () => {
        storytellerChooseOneMock.mockResolvedValue(TroubleBrewing);
        const edition = await SetupSheet.getInstance().setupEdition();
        expect(edition).toBe(TroubleBrewing);
    });
});
