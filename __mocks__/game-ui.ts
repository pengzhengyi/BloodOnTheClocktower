import { mock } from 'jest-mock-extended';
import type { IGameUI } from '~/interaction/game-ui';

export const hasRaisedHandForVoteMock = jest.fn();
export const handleMock = jest.fn();
export const chooseMock = jest.fn();
export const storytellerChooseMock = jest.fn();
export const storytellerChooseOneMock = jest.fn();
export const storytellerDecideMock = jest.fn();
export const confirmMock = jest.fn();
export const storytellerConfirmMock = jest.fn();
export const sendMock = jest.fn();
export const callForNominationMock = jest.fn();

export const GAME_UI = {
    hasRaisedHandForVote: hasRaisedHandForVoteMock,
    handle: handleMock,
    choose: chooseMock,
    storytellerChoose: storytellerChooseMock,
    storytellerChooseOne: storytellerChooseOneMock,
    storytellerDecide: storytellerDecideMock,
    confirm: confirmMock,
    storytellerConfirm: storytellerConfirmMock,
    send: sendMock,
    callForNomination: callForNominationMock,
};

export function mockGameUI() {
    return mock<IGameUI>();
}

export function expectSendMockToHaveBeenCalled() {
    expect(sendMock).toHaveBeenCalled();
    sendMock.mockClear();
}
