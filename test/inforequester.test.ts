import {
    DemonInformationRequester,
    InformationRequestContext,
    LibrarianInformationRequester,
    WasherwomanInformationRequester,
} from '~/game/inforequester';
import type {
    DemonInformation,
    LibrarianInformation,
    WasherwomanInformation,
} from '~/game/information';
import type { Player } from '~/game/player';
import { mockWithPropertyValues } from '~/__mocks__/common';
import {
    mockContextForDemonInformation,
    mockContextForLibrarianInformation,
    mockContextForWasherwomanInformation,
} from '~/__mocks__/information';

describe('test DemonInformationRequester', () => {
    const requester = new DemonInformationRequester<
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

describe('test WasherwomanInformationRequester', () => {
    const requester = new WasherwomanInformationRequester<
        InformationRequestContext<WasherwomanInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForWasherwomanInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForWasherwomanInformation(true, true, false);
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForWasherwomanInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});

describe('test LibrarianInformationRequester', () => {
    const requester = new LibrarianInformationRequester<
        InformationRequestContext<LibrarianInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForLibrarianInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForLibrarianInformation(true, true, false);
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForLibrarianInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});
