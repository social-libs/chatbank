var testlib = require('./lib'),
  banklib = testlib.bank,
  utils = require('../utils')(lib),
  _bankName1 = 'InitConversations';

function instantiateIt (title, userid, userids, _expect) {
  it(title, function () {
    var ret = expect(
      qlib.promise2console(
        banklib.initiateConversationsOfUserForUsers(userid, userids, _bankName1),
        'initiateConversationsOfUserForUsers'
      )
    ).to.eventually.be.an('array').and.to.have.length(_expect);
    userid = null;
    userids = null;
    _expect = null;
    return ret;
  });
}

function sendP2PIt (title, sender, receiver, msg, _expectMsgId) {
  it(title, function () {
    var ret = expect(
      qlib.promise2console(banklib.processNewMessage(msg, sender, receiver, null, _bankName1), 'P2P')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted(sender, receiver), messageid:_expectMsgId}
    );
    sender = null;
    receiver = null;
    msg = null;
    _expectMsgId = null;
    return ret;
  });
}

describe('Initiate Conversations of User for Users', function () {
  loadMochaIntegration('social_chatbanklib');
  it('Create Bank', function () {
    return createGlobalChatBank(_bankName1, true);
  });
  instantiateIt('Initiate for andra', 'andra', ['luka', 'ra'], 2);
  sendP2PIt('luka sends andra a P2P Message', 'luka', 'andra', 'wut?', 1);
  instantiateIt('Recheck for andra => 2', 'andra', ['luka', 'ra'], 2);
  instantiateIt('Recheck for andra with extra "cica"', 'andra', ['luka', 'ra', 'cica'], 3);
  sendP2PIt('cica sends andra a P2P Message', 'cica', 'andra', 'wut?', 2);
  instantiateIt('Recheck for andra => 3', 'andra', ['luka', 'ra'], 3);
});
