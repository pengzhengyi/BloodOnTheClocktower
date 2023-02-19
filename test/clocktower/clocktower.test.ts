import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { Clocktower, type IClocktower } from '~/game/clocktower/clocktower';
import { GamePhase } from '~/game/game-phase';
import { RecallFutureDate } from '~/game/exception/recall-future-date';
import { Phase } from '~/game/phase';

async function createClocktower(phaseIndex: number): Promise<IClocktower> {
    const clocktower = new Clocktower();

    storytellerConfirmMock.mockImplementation(() => Promise.resolve(true));

    for (let i = 0; i < phaseIndex; i++) {
        await clocktower.advance();
    }

    expect(storytellerConfirmMock).toHaveBeenCalled();
    storytellerConfirmMock.mockReset();

    return clocktower;
}

describe('test basic Clocktower functionality', () => {
    test.concurrent('initial clocktower state', () => {
        const clocktower = new Clocktower();
        expect(clocktower.gamePhase.dateIndex).toEqual(0);
        expect(clocktower.today.getMoment(Phase.Setup)).toBeDefined();
    });

    test('moment for phase is recorded', async () => {
        const clocktower = await createClocktower(5);
        expect(() => clocktower.today.getMoment(Phase.Day)).toBeDefined();
    });

    test('rewind through past events', async () => {
        const clocktower = await createClocktower(4);
        const firstDawn = clocktower.getMoment(GamePhase.of(2));
        const events = Array.from(clocktower.rewind(firstDawn));
        expect(events.length).toBeGreaterThanOrEqual(3);
    });
});

describe('test Clocktower edge cases', () => {
    test('recall a future date', async () => {
        const clocktower = await createClocktower(10);
        expect(clocktower.gamePhase.dateIndex).toEqual(3);
        expect(() => clocktower.recall(8)).toThrowError(RecallFutureDate);
    });
});
