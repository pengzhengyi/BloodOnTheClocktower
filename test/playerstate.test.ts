import { PlayerState, State } from '~/game/playerstate';

describe('Test basic functionalities', () => {
    test.concurrent('get and set player state', () => {
        const playerState = PlayerState.init();
        expect(playerState.alive).toBeTrue();
        expect(playerState.healthy).toBeTrue();
        expect(playerState.sane).toBeTrue();
        expect(playerState.sober).toBeTrue();

        playerState.drunk = true;
        expect(playerState.sober).toBeFalse();
        expect(playerState.drunk).toBeTrue();

        playerState.mad = true;
        expect(playerState.sane).toBeFalse();
        expect(playerState.mad).toBeTrue();

        playerState.dead = true;
        expect(playerState.alive).toBeFalse();
        expect(playerState.dead).toBeTrue();

        expect(playerState.valueOf()).toEqual(
            State.Dead + State.Mad + State.Drunk
        );

        playerState.mad = false;
        expect(playerState.mad).toBeFalse();
        expect(playerState.sane).toBeTrue();
        expect(playerState.dead).toBeTrue();
        expect(playerState.drunk).toBeTrue();
    });

    test.concurrent('toString', () => {
        expect(
            PlayerState.of(State.Drunk).toString()
        ).toEqualIgnoringWhitespace('Alive, Drunk, Healthy, Sane');

        expect(
            PlayerState.of(State.Dead + State.Mad + State.Poisoned).toString()
        ).toEqualIgnoringWhitespace('Dead, Sober, Poisoned, Mad');
    });
});
