import { TroubleBrewing } from '~/content/editions/TroubleBrewing';
import { EditionName } from '~/game/edition';
import { SetupSheet } from '~/game/setup-sheet';
import { storytellerChooseOneMock } from '~/__mocks__/game-ui';

describe('test recommend assignments', () => {
    test('recommend non-traveller setup', async () => {
        const assignment =
            await SetupSheet.getInstance().recommendCharacterTypeComposition(
                12,
                EditionName.TroubleBrewing
            );
        expect(assignment).toEqual({
            townsfolk: 7,
            outsider: 2,
            minion: 2,
            demon: 1,
            traveller: 0,
        });
    });
});

describe('test setup edition', () => {
    test('setup edition', async () => {
        storytellerChooseOneMock.mockResolvedValue(TroubleBrewing);
        const edition = await SetupSheet.getInstance().setupEdition();
        expect(edition).toBe(TroubleBrewing);
    });
});
