export enum AbilityUseStatus {
    Failure = 0 /* 0 */,

    ErrorHandled = 0b1 /* 1 */,

    Success = 0b10 /* 2 */,

    Malfunction = 0b100 /* 4 */,

    HasInfo = 0b1000 /* 8 */,

    Communicated = 0b10000 /* 16 */,

    HasEffect = 0b100000 /* 32 */,
}

export const AbilitySuccessUseWhenMalfunction =
    AbilityUseStatus.Success | AbilityUseStatus.Malfunction;

export const AbilitySuccessUseWhenHasEffect =
    AbilityUseStatus.Success | AbilityUseStatus.HasEffect;

export const AbilitySuccessCommunicatedInfo =
    AbilityUseStatus.Success |
    AbilityUseStatus.HasInfo |
    AbilityUseStatus.Communicated;
