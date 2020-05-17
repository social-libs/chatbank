var utils = require('../utils')(lib);
var testlib = require('./lib');
describe('Basic Test', function () {
  loadMochaIntegration('social_chatbanklib');
  it('Create Bank', function () {
    return createGlobalChatBank('BasicBank', true);
  });
  it('Process new P2P Message', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('andra', null, 'luka', 'blah', null), 'P2P')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted('andra', 'luka'), messageid:1}
    );
  });
  it('Mark message rcvd by andra', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageRcvd('andra', BasicBank_LastConversationNotified.id, 1), 'markMessageRcvd')
    ).to.eventually.equal(true);
  });
  it('Mark message seen by andra', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageSeen('andra', BasicBank_LastConversationNotified.id, 1), 'markMessageSeen')
    ).to.eventually.equal(true);
  });
  it('Mark message rcvd by luka', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageRcvd('luka', BasicBank_LastConversationNotified.id, 1), 'markMessageRcvd')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted('andra', 'luka'), messageid:1, rcvdby: 'luka'}
    );
  });
  it('Mark message seen by luka', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageSeen('luka', BasicBank_LastConversationNotified.id, 1), 'markMessageSeen')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted('andra', 'luka'), messageid:1, seenby: 'luka'}
    );
  });
  /*
   * luka edits the message - should fail
   * andra edits the message - some criterion in the check of the last notified message, e.g. edits array has length===1
   */
  it('luka edits the message - should fail', function () {
    return expect(
      qlib.promise2console(BasicBank.editMessage('luka', BasicBank_LastConversationNotified.id, 1, 'Edited content', {}), 'editMessage')
    ).to.eventually.be.rejectedWith(
      1
    );
  });
  it('Report user activity', function () {
    return expect(
      qlib.promise2console(BasicBank.ackUserActivity('andra', BasicBank_LastConversationNotified.id), 'ackUserActivity')
    ).to.eventually.equal(true);
  });
  it('andra edits the message - some criterion in the check of the last notified message, e.g. edits array has length===1', function () {
    return expect(
      qlib.promise2console(BasicBank.editMessage('andra', BasicBank_LastConversationNotified.id, 1, 'Edited content', {}), 'editMessage')
    ).to.eventually.include(
      {editedMessage: 'Edited content'}
    );
  });
  it('Answer to P2P Message', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('luka', null, 'andra', 'wut?', null), 'P2P')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted('andra', 'luka'), messageid:2}
    );
  });
  it('Create a new group', function () {
    return expect(
      qlib.promise2console(BasicBank.createNewGroup('luka', '1'), 'New Group')
    ).to.eventually.be.a('string');
  });
  it('Creator sends a message to 1-user group', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('luka', BasicBank_LastConversationNotified.id, null, 'There you go!', null), 'Creator sends a message')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 3} 
    );
  });
  it('Add a new user to Group', function () {
    return expect(
      qlib.promise2console(BasicBank.addUserToGroup(BasicBank_LastConversationNotified.id, 'luka', 'ra'), 'luka adds ra')
    ).to.eventually.equal(true);
  });
  it('Mark message rcvd by ra', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageRcvd('ra', BasicBank_LastConversationNotified.id, 3), 'markMessageRcvd')
    ).to.eventually.equal(true); //message 3 was created before ra joined
  });
  it('Mark message seen by ra', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageSeen('ra', BasicBank_LastConversationNotified.id, 3), 'markMessageSeen')
    ).to.eventually.equal(true); //message 3 was created before ra joined
  });
  it('Newly added user sends a message to 1-user group', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('ra', BasicBank_LastConversationNotified.id, null, 'There you go!', null), 'New User sends a message')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 4} 
    );
  });
  it('Mark message rcvd by luka', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageRcvd('luka', BasicBank_LastConversationNotified.id, 4), 'markMessageRcvd')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 4, rcvdby: 'luka'} 
    );
  });
  it('Mark message seen by luka', function () {
    return expect(
      qlib.promise2console(BasicBank.markMessageSeen('luka', BasicBank_LastConversationNotified.id, 4), 'markMessageSeen')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 4, seenby: 'luka'} 
    );
  });
  it('Newly added user adds another user to Group', function () {
    return expect(
      qlib.promise2console(BasicBank.addUserToGroup(BasicBank_LastConversationNotified.id, 'ra', 'andra'), 'New User adds another User to Group')
    ).to.eventually.equal(true);
  });
  it('Latest user sends a message to Group', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('andra', BasicBank_LastConversationNotified.id, null, 'And there you go from andra too', null), 'Latest user sends a message')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 5} 
    );
  });
  it('User creates a group with members', function () {
    return expect(
      qlib.promise2console(BasicBank.createNewGroupWithMembers('luka', 'new group', ['andra', 'ra']), 'createNewGroupWithMembers')
    ).to.eventually.include(
      {name: 'new group', members: 2}
    );
  });
  it('One of the members sends a message to the new group', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('ra', BasicBank_LastConversationNotified.id, null, 'There you go!', null), 'New User sends a message')
    ).to.eventually.include(
      {id: BasicBank_LastConversationNotified.id, messageid: 6} 
    );
  });
  //preview testing
  it('luka sends a message with link, preview true', function () {
    return expect(
      qlib.promise2console(BasicBank.processNewMessage('andra', null, 'luka', 'Divi ovo: https://www.youtube.com/watch?v=v-BvRlsbUiU', {preview:true}), 'P2P')
    ).to.eventually.include(
      {id:utils.zeroStringJoinSorted('andra', 'luka'), messageid:7}
    );
  });
  it('Wait for preview', function () {
    this.timeout(1e7);
    return waitForConversationNotification({'preview.root': 'https://www.youtube.com'});
  });
  it('Finish', function () {
    return deInitChatLib();
  });
});
