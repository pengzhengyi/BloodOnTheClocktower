import { Duration, IndefiniteDuration } from '~/game/duration';
import { UnsupportedOperation } from '~/game/exception';
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

    test.concurrent('duration in relative to a gamephase', () => {
        const duration = new Duration(GamePhase.of(4), GamePhase.of(8));

        expect(duration.isActiveAt(GamePhase.of(7))).toBeTrue();
        expect(duration.hasEndedAt(GamePhase.of(12))).toBeTrue();
        expect(duration.hasStartedAt(GamePhase.of(2))).toBeFalse();
    });
});

describe('test basic IndefiniteDuration functionality', () => {
    test.concurrent('equality', () => {
        const duration1 = new IndefiniteDuration(GamePhase.of(7));
        const duration2 = new IndefiniteDuration(GamePhase.of(7));

        expect(duration1.equals(duration2)).toBeTrue();
    });

    test.concurrent('converting to string', () => {
        const duration = new IndefiniteDuration(GamePhase.firstNight());
        expect(duration.toString()).toEqual('Night 0 -- ?');
    });

    test.concurrent('duration as differences', () => {
        const duration = new IndefiniteDuration(GamePhase.of(5));

        expect(duration.atSameDate).toBeFalse();
        expect(() => duration.phaseElapsed).toThrowError(UnsupportedOperation);
        expect(() => duration.dateElapsed).toThrowError(UnsupportedOperation);
    });

    test.concurrent('duration in relative to a gamephase', () => {
        const duration = new IndefiniteDuration(GamePhase.of(4));

        expect(duration.isActiveAt(GamePhase.of(7))).toBeTrue();
        expect(duration.hasEndedAt(GamePhase.of(12))).toBeFalse();
        expect(duration.hasStartedAt(GamePhase.of(2))).toBeFalse();
    });
});
