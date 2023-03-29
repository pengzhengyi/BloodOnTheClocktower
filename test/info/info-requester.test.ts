import type { ChefInformation } from '~/game/info/provider/chef';
import type { DemonInformation } from '~/game/info/provider/demon';
import type { EmpathInformation } from '~/game/info/provider/empath';
import type { FortuneTellerInformation } from '~/game/info/provider/fortuneteller';
import type { InvestigatorInformation } from '~/game/info/provider/investigator';
import type { LibrarianInformation } from '~/game/info/provider/librarian';
import type { MinionInformation } from '~/game/info/provider/minion';
import type { RavenkeeperInformation } from '~/game/info/provider/ravenkeeper';
import type { SpyInformation } from '~/game/info/provider/spy';
import type { TravellerInformation } from '~/game/info/provider/traveller';
import type { UndertakerInformation } from '~/game/info/provider/undertaker';
import type { WasherwomanInformation } from '~/game/info/provider/washerwoman';
import { ChefInformationRequester } from '~/game/info/requester/chef';
import { DemonInformationRequester } from '~/game/info/requester/demon';
import { EmpathInformationRequester } from '~/game/info/requester/empath';
import {
    FortuneTellerInformationRequester,
    type FortuneTellerInformationRequestContext,
} from '~/game/info/requester/fortuneteller';
import { InvestigatorInformationRequester } from '~/game/info/requester/investigator';
import { LibrarianInformationRequester } from '~/game/info/requester/librarian';
import { MinionInformationRequester } from '~/game/info/requester/minion';
import {
    RavenkeeperInformationRequester,
    type RavenkeeperInformationRequestContext,
} from '~/game/info/requester/ravenkeeper';
import { type InformationRequestContext } from '~/game/info/requester/requester';
import { SpyInformationRequester } from '~/game/info/requester/spy';
import { TravellerInformationRequester } from '~/game/info/requester/traveller';
import {
    UndertakerInformationRequester,
    type UndertakerInformationRequestContext,
} from '~/game/info/requester/undertaker';
import { WasherwomanInformationRequester } from '~/game/info/requester/washerwoman';
import {
    mockContextForChefInformation,
    mockContextForDemonInformation,
    mockContextForEmpathInformation,
    mockContextForFortuneTellerInformation,
    mockContextForInvestigatorInformation,
    mockContextForLibrarianInformation,
    mockContextForMinionInformation,
    mockContextForRavenkeeperInformation,
    mockContextForSpyInformation,
    mockContextForTravellerInformation,
    mockContextForUndertakerInformation,
    mockContextForWasherwomanInformation,
} from '~/__mocks__/information';
import { mockPlayerWithState } from '~/__mocks__/player';

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
            context.requestedPlayer = mockPlayerWithState(
                undefined,
                undefined,
                false
            );
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
            context.requestedPlayer = mockPlayerWithState();
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
            context.requestedPlayer = mockPlayerWithState(
                undefined,
                undefined,
                false
            );
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
            context.requestedPlayer = mockPlayerWithState();
            expect(await requester.willGetTrueInformation(context)).toBeTrue();
        }
    );
});

describe('test TravellerInformationRequester', () => {
    const requester = new TravellerInformationRequester<
        InformationRequestContext<TravellerInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForTravellerInformation(
            true,
            true,
            true,
            true,
            true
        );
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent(
        'not eligible because player is not Traveller',
        async () => {
            const context = mockContextForTravellerInformation(
                true,
                false,
                true,
                true,
                true
            );
            expect(await requester.isEligible(context)).toBeFalse();
        }
    );

    test.concurrent('not eligible because is not first night', async () => {
        const context = mockContextForTravellerInformation(
            true,
            true,
            true,
            false,
            true
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because is not evil', async () => {
        const context = mockContextForTravellerInformation(
            true,
            true,
            true,
            true,
            false
        );
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent(
        'willGetTrueInformation returns false when player is drunk',
        async () => {
            const context = mockContextForTravellerInformation(
                true,
                true,
                true,
                true,
                true
            );
            context.requestedPlayer = mockPlayerWithState(
                undefined,
                undefined,
                false
            );
            expect(await requester.willGetTrueInformation(context)).toBeFalse();
        }
    );

    test.concurrent(
        'willGetTrueInformation returns true when player is normal',
        async () => {
            const context = mockContextForTravellerInformation(
                true,
                true,
                true,
                true,
                true
            );
            context.requestedPlayer = mockPlayerWithState();
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
        FortuneTellerInformationRequestContext<FortuneTellerInformation>
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
        UndertakerInformationRequestContext<UndertakerInformation>
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
        RavenkeeperInformationRequestContext<RavenkeeperInformation>
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

describe('test SpyInformationRequester', () => {
    const requester = new SpyInformationRequester<
        InformationRequestContext<SpyInformation>
    >();

    test.concurrent('should be eligible', async () => {
        const context = mockContextForSpyInformation(true, true, true);
        expect(await requester.isEligible(context)).toBeTrue();
    });

    test.concurrent('not eligible because is not night', async () => {
        const context = mockContextForSpyInformation(true, true, false);
        expect(await requester.isEligible(context)).toBeFalse();
    });

    test.concurrent('not eligible because requester is dead', async () => {
        const context = mockContextForSpyInformation(true, false, true);
        expect(await requester.isEligible(context)).toBeFalse();
    });
});
