import { DeadReason } from '~/game/dead-reason';
import { DrunkReason } from '~/game/drunk-reason';
import { PlayerState, State } from '~/game/player-state';

describe('Test basic functionalities', () => {
    test.concurrent('get and set player state', () => {
        const playerState = new PlayerState();
        expect(playerState.alive).toBeTrue();
        expect(playerState.healthy).toBeTrue();
        expect(playerState.sane).toBeTrue();
        expect(playerState.sober).toBeTrue();

        playerState.setNegativeState(State.Drunk, true, DrunkReason.Other);
        expect(playerState.sober).toBeFalse();
        expect(playerState.drunk).toBeTrue();

        const madCause = {};

        playerState.setNegativeState(State.Mad, true, madCause);
        expect(playerState.sane).toBeFalse();
        expect(playerState.mad).toBeTrue();

        playerState.setNegativeState(State.Dead, true, DeadReason.Other);
        expect(playerState.alive).toBeFalse();
        expect(playerState.dead).toBeTrue();

        expect(playerState.valueOf()).toEqual(
            State.Dead + State.Mad + State.Drunk
        );

        playerState.setNegativeState(State.Mad, false, madCause);
        expect(playerState.mad).toBeFalse();
        expect(playerState.sane).toBeTrue();
        expect(playerState.dead).toBeTrue();
        expect(playerState.drunk).toBeTrue();
    });

    test.concurrent('toString', () => {
        const playerState1 = new PlayerState();
        playerState1.setNegativeState(State.Drunk, true, {});

        expect(playerState1.toString()).toEqualIgnoringWhitespace(
            'Alive, Drunk, Healthy, Sane'
        );

        const playerState2 = new PlayerState();
        playerState2.setNegativeState(State.Dead, true, {});
        playerState2.setNegativeState(State.Mad, true, {});
        playerState2.setNegativeState(State.Poisoned, true, {});

        expect(playerState2.toString()).toEqualIgnoringWhitespace(
            'Dead, Sober, Poisoned, Mad'
        );
    });
});
