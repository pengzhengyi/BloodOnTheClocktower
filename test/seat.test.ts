import { storytellerConfirmMock } from '~/__mocks__/gameui';
import { Seat } from '~/game/seat';
import { createBasicPlayer } from '~/__mocks__/player';

beforeAll(() => {
    storytellerConfirmMock.mockImplementation(async () => await true);
});

afterAll(() => {
    storytellerConfirmMock.mockReset();
});

describe('Test basic functionalities', () => {
    test("remove a player from seat should make the player's assigned seat position undefined", async () => {
        const player = await createBasicPlayer();
        const seat = await Seat.init(5, player);
        expect(player.seatNumber).toEqual(5);
        expect(storytellerConfirmMock).toHaveBeenCalledOnce();

        expect(await seat.remove()).toBe(player);
        expect(storytellerConfirmMock).toHaveBeenCalledTimes(2);
        expect(player.seatNumber).toBeUndefined();
    });
});
