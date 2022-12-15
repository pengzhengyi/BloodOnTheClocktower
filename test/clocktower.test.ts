import { GAME_UI, storytellerConfirmMock } from '~/__mocks__/gameui';

jest.mock('~/interaction/gameui', () => ({
    GAME_UI,
}));

import { Clocktower } from '~/game/clocktower';
import { Phase } from '~/game/gamephase';
import { RecallFutureDate } from '~/game/exception';

async function createClocktower(phaseIndex: number): Promise<Clocktower> {
    const clocktower = new Clocktower();

    storytellerConfirmMock.mockImplementation(async () => await true);

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
        expect(clocktower.dateIndex).toEqual(0);
        expect(clocktower.today.getMoment(Phase.Setup)).toBeDefined();
    });

    test('moment for phase is recorded', async () => {
        const clocktower = await createClocktower(5);
        expect(() => clocktower.today.getMoment(Phase.Day)).toBeDefined();
    });
});

describe('test Clocktower edge cases', () => {
    test('recall a future date', async () => {
        const clocktower = await createClocktower(10);
        expect(clocktower.dateIndex).toEqual(3);
        expect(() => clocktower.recall(8)).toThrowError(RecallFutureDate);
    });
});
