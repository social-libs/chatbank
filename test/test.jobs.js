var testlib = require('./lib'),
  jobslib = testlib.jobs;
describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    return setGlobal('Bank', testlib.createBank('basictest.db', true));
  });
  it('Push a message', function () {
    return qlib.promise2console(jobslib.pushMessage('blah'), 'pushMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage('blah', 'andra', 'luka', null), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage('wut?', 'luka', 'andra', null), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(jobslib.processNewMessage("that's wut I sed", 'andra', 'luka', null), 'processNewPeer2PeerMessage');
  });
  it('Create new Chat Group', function () {
    return qlib.promise2console(jobslib.createNewChatGroup('andra'), 'createNewChatGroup');
  });
  it('Add a new User to Chat Group', function () {
    return qlib.promise2console(jobslib.addNewUser2ChatGroup(LastConversationNotified.id, 'andra', 'luka'), 'addNewUser2ChatGroup');
  });
  it('Add a new User to Chat Group - wrong changer', function () {
    return expect(jobslib.addNewUser2ChatGroup(LastConversationNotified.id, 'andra5', 'luka')).to.be.rejected;
  });
  it('Add a new User to Chat Group - wrong changer', function () {
    return expect(jobslib.addNewUser2ChatGroup(LastConversationNotified.id, 'andra5', 'luka')).to.be.rejectedWith('andra5');
  });
  it('Add a new User to Chat Group - wrong group', function () {
    return expect(jobslib.addNewUser2ChatGroup(LastConversationNotified.id+'bla', 'andra', 'luka')).to.be.rejectedWith(LastConversationNotified.id+'bla');
  });
  it('Process new peer2group message', function () {
    return qlib.promise2console(jobslib.processNewMessage("You made a group, andra?", 'luka', null, LastConversationNotified.id), 'processNewPeer2GroupMessage');
  });
  it('Non-creator adds a new user to Group', function () {
    return qlib.promise2console(jobslib.addNewUser2ChatGroup(LastConversationNotified.id, 'luka', 'ra'), 'addNewUser2ChatGroup');
  });
  it('Process new peer2group message', function () {
    return qlib.promise2console(jobslib.processNewMessage("Hi to all!", 'ra', null, LastConversationNotified.id), 'processNewPeer2GroupMessage');
  });
  it('Non-creator removes a user from Group', function () {
    return qlib.promise2console(jobslib.removeUserFromChatGroup(LastConversationNotified.id, 'luka', 'ra'), 'removeUserFromChatGroup');
  });
  it('Process new peer2group message from removed user', function () {
    return jobslib.processNewMessage("Does this work still?", 'ra', null, LastConversationNotified.id).should.be.rejectedWith('ra');
  });
  it('Get all conversations of andra', function () {
    return qlib.promise2console(jobslib.allConversationsOfUser('andra'), 'All conversations of andra');
  });
});

