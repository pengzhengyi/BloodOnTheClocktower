import { GameEnvironment } from '~/game/environment';
import { GameHasTooManyPlayers } from '~/game/exception/game-has-too-many-players';
import { GameHasTooFewPlayers } from '~/game/exception/game-has-too-few-players';
import { EditionIds } from '~/game/edition/edition-id';

describe('Test validateNumberOfPlayers', () => {
    const validator = GameEnvironment.current as any;

    test.concurrent('3 players', () => {
        expect(() =>
            validator.validateNumberOfPlayers(3, EditionIds.SectsViolets)
        ).toThrowError(GameHasTooFewPlayers);
        expect(() =>
            validator.validateNumberOfPlayers(3, EditionIds.TroubleBrewing)
        ).toThrowError(GameHasTooFewPlayers);
    });

    test.concurrent('5 players', () => {
        validator.validateNumberOfPlayers(5, EditionIds.TroubleBrewing);
        expect(() =>
            validator.validateNumberOfPlayers(5, EditionIds.BadMoonRising)
        ).toThrowError(GameHasTooFewPlayers);
    });

    test.concurrent('7 players', () => {
        validator.validateNumberOfPlayers(7, EditionIds.SectsViolets);
        validator.validateNumberOfPlayers(7, EditionIds.TroubleBrewing);
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
                EditionIds.BadMoonRising,
                3
            )
        );

        expect(assignments).toHaveLength(3 + 1);

        for (const assignment of assignments) {
            const numTraveller = assignment.traveller;

            const expectedAssignment =
                await GameEnvironment.current.recommendCharacterTypeComposition(
                    13 - numTraveller,
                    EditionIds.TroubleBrewing
                );
            expectedAssignment.traveller = numTraveller;

            expect(assignment).toEqual(expectedAssignment);
        }
    });
});
