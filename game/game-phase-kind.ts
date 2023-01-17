export enum BasicGamePhaseKind {
    FirstNight = 1,
    NonfirstNight = 2,
    Other = 4,
}

export enum CompositeGamePhaseKind {
    // convenient utility
    EveryNight = BasicGamePhaseKind.FirstNight |
        BasicGamePhaseKind.NonfirstNight,
    ALL = BasicGamePhaseKind.FirstNight |
        BasicGamePhaseKind.NonfirstNight |
        BasicGamePhaseKind.Other,
}

export type GamePhaseKind = BasicGamePhaseKind | CompositeGamePhaseKind;

export const ALL_GAME_PHASE_KINDS = [
    BasicGamePhaseKind.FirstNight,
    BasicGamePhaseKind.NonfirstNight,
    BasicGamePhaseKind.Other,
];
