import { mockDeep } from 'jest-mock-extended';
import { storytellerConfirmMock } from './game-ui';
import type { IClocktower } from '~/game/clocktower/clocktower';
import type { Phase } from '~/game/phase';

export function mockClocktower(): IClocktower {
    return mockDeep<IClocktower>();
}

export async function clocktowerAdvanceToDateAndPhase(
    clocktower: IClocktower,
    dateIndex: number,
    phase: Phase
) {
    storytellerConfirmMock.mockResolvedValue(true);

    while (
        clocktower.gamePhase.dateIndex < dateIndex ||
        (clocktower.gamePhase.dateIndex === dateIndex &&
            clocktower.gamePhase.phase !== phase)
    ) {
        await clocktower.advance();
    }

    storytellerConfirmMock.mockReset();
}
