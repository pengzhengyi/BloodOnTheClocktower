import { Duration } from '~/game/duration';
import { GamePhase } from '~/game/gamephase';

describe('test basic Duration functionality', () => {
    test.concurrent('equality', () => {
        const duration1 = Duration.onePhase(GamePhase.of(7));
        const duration2 = new Duration(GamePhase.of(7), GamePhase.of(8));

        expect(duration1.equals(duration2)).toBeTrue();
    });

    test.concurrent('converting to string', () => {
        const duration = Duration.onePhase(GamePhase.firstNight());
        expect(duration.toString()).toEqual('Night 0 -- Dawn 0');
    });

    test.concurrent('duration as differences', () => {
        const duration = new Duration(GamePhase.of(5), GamePhase.of(12));

        expect(duration.atSameDate).toBeFalse();
        expect(duration.phaseElapsed).toEqual(12 - 5);
        expect(duration.dateElapsed).toEqual(2);
    });
});
