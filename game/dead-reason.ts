export enum DeadReason {
    DemonAttack = 'Killed by demon',
    SlayerKill = 'Killed as demon by slayer',
    NominateVirgin = 'Executed for nominating the virgin',
    Executed = 'Executed as a nominated player because has enough votes to be executed and more votes than any other player today',
    Exiled = 'The group decision to kill a Traveller during the day',
    Other = 'other',
}
