import { mock } from 'jest-mock-extended';
import { SeatAssignmentMode } from '~/game/seating/seat-assignment-mode';
import type { ISetupContext, ISetupSheet } from '~/game/setup-sheet';
import { SetupSheet } from '~/game/setup-sheet';

export function mockSetupSheet(): ISetupSheet {
    return mock<ISetupSheet>();
}

export function createBasicSetupSheet(): ISetupSheet {
    return SetupSheet.getInstance();
}

export function mockSetupContext(
    setupContext?: Partial<ISetupContext>
): ISetupContext {
    const _setupContext = mock<ISetupContext>();
    _setupContext.seatAssignment = SeatAssignmentMode.NaturalInsert;

    if (setupContext !== undefined) {
        Object.assign(_setupContext, setupContext);
    }

    return _setupContext;
}
