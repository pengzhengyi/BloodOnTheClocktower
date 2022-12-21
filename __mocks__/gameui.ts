export const hasRaisedHandForVoteMock = jest.fn();
export const handleMock = jest.fn();
export const chooseMock = jest.fn();
export const storytellerChooseMock = jest.fn();
export const storytellerChooseOneMock = jest.fn();
export const storytellerDecideMock = jest.fn();
export const confirmMock = jest.fn();
export const storytellerConfirmMock = jest.fn();
export const sendMock = jest.fn();

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
};
