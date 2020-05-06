var testlib = require('./lib'),
  jobslib = testlib.jobs;
describe('Basic Test', function () {
  loadMochaIntegration('social_chatbanklib');
  it('Create Bank', function () {
    return createGlobalChatBank('JobsBank', true);
  });
  it('Push a message', function () {
    return qlib.promise2console(jobslib.pushMessage('blah', 'JobsBank'), 'pushMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage('blah', 'andra', 'luka', null, null, 'JobsBank'), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage('wut?', 'luka', 'andra', null, null, 'JobsBank'), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage("that's wut I sed", 'andra', 'luka', null, null, 'JobsBank'), 'processNewPeer2PeerMessage');
  });
  it('Create new Chat Group', function () {
    return qlib.promise2console(jobslib.createNewChatGroup('andra', '1', 'JobsBank'), 'createNewChatGroup');
  });
  it('Add a new User to Chat Group', function () {
    return qlib.promise2console(jobslib.addNewUser2ChatGroup(JobsBank_LastConversationNotified.id, 'andra', 'luka', 'JobsBank'), 'addNewUser2ChatGroup');
  });
  it('Add a new User to Chat Group - wrong changer', function () {
    return expect(jobslib.addNewUser2ChatGroup(JobsBank_LastConversationNotified.id, 'andra5', 'luka', 'JobsBank')).to.be.rejected;
  });
  it('Add a new User to Chat Group - wrong changer', function () {
    return expect(jobslib.addNewUser2ChatGroup(JobsBank_LastConversationNotified.id, 'andra5', 'luka', 'JobsBank')).to.be.rejectedWith('andra5');
  });
  it('Add a new User to Chat Group - wrong group', function () {
    return expect(jobslib.addNewUser2ChatGroup(JobsBank_LastConversationNotified.id+'bla', 'andra', 'luka', 'JobsBank')).to.be.rejectedWith(JobsBank_LastConversationNotified.id+'bla');
  });
  it('Process new peer2group message', function () {
    return qlib.promise2console(jobslib.processNewMessage("You made a group, andra?", 'luka', null, JobsBank_LastConversationNotified.id, null, 'JobsBank'), 'processNewPeer2GroupMessage');
  });
  it('Non-creator adds a new user to Group', function () {
    return qlib.promise2console(jobslib.addNewUser2ChatGroup(JobsBank_LastConversationNotified.id, 'luka', 'ra', 'JobsBank'), 'addNewUser2ChatGroup');
  });
  it('Process new peer2group message', function () {
    return qlib.promise2console(jobslib.processNewMessage("Hi to all!", 'ra', null, JobsBank_LastConversationNotified.id, null, 'JobsBank'), 'processNewPeer2GroupMessage');
  });
  it('Non-creator removes a user from Group', function () {
    return qlib.promise2console(jobslib.removeUserFromChatGroup(JobsBank_LastConversationNotified.id, 'luka', 'ra', 'JobsBank'), 'removeUserFromChatGroup');
  });
  it('Process new peer2group message from removed user', function () {
    return jobslib.processNewMessage("Does this work still?", 'ra', null, JobsBank_LastConversationNotified.id, null, 'JobsBank').should.be.rejectedWith('ra');
  });
  it('Get all conversations of andra', function () {
    return qlib.promise2console(jobslib.allConversationsOfUser('andra', 'JobsBank'), 'All conversations of andra');
  });
});

