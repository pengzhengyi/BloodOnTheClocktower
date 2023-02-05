import { EditionName } from '~/game/edition';
import { GameEnvironment } from '~/game/environment';
import { GameHasTooFewPlayers, GameHasTooManyPlayers } from '~/game/exception';

describe('Test validateNumberOfPlayers', () => {
    const validator = GameEnvironment.current as any;

    test.concurrent('3 players', () => {
        expect(() =>
            validator.validateNumberOfPlayers(3, EditionName.SectsViolets)
        ).toThrowError(GameHasTooFewPlayers);
        expect(() =>
            validator.validateNumberOfPlayers(3, EditionName.TroubleBrewing)
        ).toThrowError(GameHasTooFewPlayers);
    });

    test.concurrent('5 players', () => {
        validator.validateNumberOfPlayers(5, EditionName.TroubleBrewing);
        expect(() =>
            validator.validateNumberOfPlayers(5, EditionName.BadMoonRising)
        ).toThrowError(GameHasTooFewPlayers);
    });

    test.concurrent('7 players', () => {
        validator.validateNumberOfPlayers(7, EditionName.SectsViolets);
        validator.validateNumberOfPlayers(7, EditionName.TroubleBrewing);
    });

    test.concurrent('15 players', () => {
        validator.validateNumberOfPlayers(15, true);
        validator.validateNumberOfPlayers(15, false);
    });

    test.concurrent('21 players', () => {
        expect(() => validator.validateNumberOfPlayers(21, true)).toThrowError(
            GameHasTooManyPlayers
        );
        expect(() => validator.validateNumberOfPlayers(21, false)).toThrowError(
            GameHasTooManyPlayers
        );
    });
});

describe('test recommend', () => {
    test('recommend traveller setup', async () => {
        const assignments = Array.from(
            await GameEnvironment.current.recommendCharacterTypeCompositionWithTravellerUpperbound(
                13,
                EditionName.BadMoonRising,
                3
            )
        );

        expect(assignments).toHaveLength(3 + 1);

        for (const assignment of assignments) {
            const numTraveller = assignment.traveller;

            const expectedAssignment =
                await GameEnvironment.current.recommendCharacterTypeComposition(
                    13 - numTraveller,
                    EditionName.TroubleBrewing
                );
            expectedAssignment.traveller = numTraveller;

            expect(assignment).toEqual(expectedAssignment);
        }
    });
});
