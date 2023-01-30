import { storytellerConfirmMock } from '~/__mocks__/game-ui';
import { Seat } from '~/game/seating/seat';
import { createBasicPlayer } from '~/__mocks__/player';

describe('Test basic functionalities', () => {
    test("remove a player from seat should make the player's assigned seat position undefined", async () => {
        const player = await createBasicPlayer();
        const seat = new Seat(5);
        storytellerConfirmMock.mockResolvedValue(true);
        await seat.sit(player);

        expect(player.seatNumber).toEqual(5);

        expect(await seat.remove()).toBe(player);
        expect(storytellerConfirmMock).toHaveBeenCalledOnce();
        storytellerConfirmMock.mockReset();
        expect(player.seatNumber).toBeUndefined();
    });
});
