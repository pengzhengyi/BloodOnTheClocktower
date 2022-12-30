import {
    ChefInformationRequester,
    DemonInformationRequester,
    EmpathInformationRequester,
    FortuneTellerInformationRequester,
    InformationRequestContext,
    InvestigatorInformationRequester,
    LibrarianInformationRequester,
    MinionInformationRequester,
    RavenkeeperInformationRequester,
    UndertakerInformationRequester,
    WasherwomanInformationRequester,
} from '~/game/inforequester';
import type {
    ChefInformation,
    DemonInformation,
    EmpathInformation,
    FortuneTellerInformation,
    InvestigatorInformation,
    LibrarianInformation,
    MinionInformation,
    RavenkeeperInformation,
    UndertakerInformation,
    WasherwomanInformation,
} from '~/game/information';
import type { Player } from '~/game/player';
import { mockWithPropertyValues } from '~/__mocks__/common';
import {
    mockContextForChefInformation,
    mockContextForDemonInformation,
    mockContextForEmpathInformation,
    mockContextForFortuneTellerInformation,
    mockContextForInvestigatorInformation,
    mockContextForLibrarianInformation,
    mockContextForMinionInformation,
    mockContextForRavenkeeperInformation,
    mockContextForUndertakerInformation,
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

describe('test MinionInformationRequester', () => {
    const requester = new MinionInformationRequester<
        InformationRequestContext<MinionInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForMinionInformation(
            true,
            9,
            true,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because player is not minion', async () => {
        const context = mockContextForMinionInformation(
            true,
            12,
            false,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForMinionInformation(
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
            const context = mockContextForMinionInformation(
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
            const context = mockContextForMinionInformation(
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
            const context = mockContextForMinionInformation(
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

describe('test InvestigatorInformationRequester', () => {
    const requester = new InvestigatorInformationRequester<
        InformationRequestContext<InvestigatorInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForInvestigatorInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForInvestigatorInformation(
            true,
            true,
            false
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForInvestigatorInformation(
            true,
            false,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });
});

describe('test ChefInformationRequester', () => {
    const requester = new ChefInformationRequester<
        InformationRequestContext<ChefInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForChefInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForChefInformation(true, true, false);
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForChefInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});

describe('test EmpathInformationRequester', () => {
    const requester = new EmpathInformationRequester<
        InformationRequestContext<EmpathInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForEmpathInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not night', async () => {
        const context = mockContextForEmpathInformation(true, true, false);
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForEmpathInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});

describe('test FortuneTellerInformationRequester', () => {
    const requester = new FortuneTellerInformationRequester<
        InformationRequestContext<FortuneTellerInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForFortuneTellerInformation(
            true,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not night', async () => {
        const context = mockContextForFortuneTellerInformation(
            true,
            true,
            false
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForFortuneTellerInformation(
            true,
            false,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });
});

describe('test UndertakerInformationRequester', () => {
    const requester = new UndertakerInformationRequester<
        InformationRequestContext<UndertakerInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForUndertakerInformation(
            true,
            true,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not non-first night', async () => {
        const context = mockContextForUndertakerInformation(
            true,
            true,
            false,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForUndertakerInformation(
            true,
            false,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    /**
     * {@link `undertaker["gameplay"][3]`}
     */
    test.concurrent(
        'Nobody was executed today. That night, the Undertaker does not wake.',
        async () => {
            const context = mockContextForUndertakerInformation(
                true,
                false,
                true,
                false
            );
            expect(await requester.isEligible(context)).toBeFalse();
        }
    );
});

describe('test RavenkeeperInformationRequester', () => {
    const requester = new RavenkeeperInformationRequester<
        InformationRequestContext<RavenkeeperInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForRavenkeeperInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not night', async () => {
        const context = mockContextForRavenkeeperInformation(
            true,
            false,
            false
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is alive', async () => {
        const context = mockContextForRavenkeeperInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});
