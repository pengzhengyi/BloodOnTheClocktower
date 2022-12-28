import {
    DemonInformationRequester,
    InformationRequestContext,
} from '~/game/inforequester';
import { DemonInformation } from '~/game/information';
import { Player } from '~/game/player';
import { mockWithPropertyValues } from '~/__mocks__/common';
import { mockContextForDemonInformation } from '~/__mocks__/information';

describe('test DemonInformation', () => {
    const requester = new DemonInformationRequester<
        DemonInformation,
        InformationRequestContext<DemonInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForDemonInformation(
            true,
            9,
            true,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because player is not demon', async () => {
        const context = mockContextForDemonInformation(
            true,
            12,
            false,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForDemonInformation(
            true,
            15,
            true,
            true,
            false
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent(
        'not eligible because number of players is less than 7',
        async () => {
            const context = mockContextForDemonInformation(
                true,
                6,
                true,
                true,
                true
            );
            expect(await requester.isEligible(context)).toBeFalse();
        }
    );

    test.concurrent(
        'willGetTrueInformation returns false when player is drunk',
        async () => {
            const context = mockContextForDemonInformation(
                true,
                9,
                true,
                true,
                true
            );
            context.requestedPlayer = mockWithPropertyValues<
                Player,
                [boolean, boolean]
            >(['drunk', 'poisoned'], [true, false]);
            expect(await requester.willGetTrueInformation(context)).toBeFalse();
        }
    );

    test.concurrent(
        'willGetTrueInformation returns true when player is normal',
        async () => {
            const context = mockContextForDemonInformation(
                true,
                9,
                true,
                true,
                true
            );
            context.requestedPlayer = mockWithPropertyValues<
                Player,
                [boolean, boolean]
            >(['drunk', 'poisoned'], [false, false]);
            expect(await requester.willGetTrueInformation(context)).toBeTrue();
        }
    );
});
