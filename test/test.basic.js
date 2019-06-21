var testlib = require('./lib');
describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    return setGlobal('Bank', testlib.createBank('basictest.db', true));
  });
  it('Process new P2P Message', function () {
    return qlib.promise2console(Bank.processNewMessage('andra', null, 'luka', 'blah'), 'P2P');
  });
  it('Answer to P2P Message', function () {
    return qlib.promise2console(Bank.processNewMessage('luka', null, 'andra', 'wut?'), 'P2P');
  });
  it('Create a new group', function () {
    return qlib.promise2console(Bank.createNewGroup('luka'), 'New Group');
  });
  it('Creator sends a message to 1-user group', function () {
    return qlib.promise2console(Bank.processNewMessage('luka', LastConversationNotified.id, null, 'There you go!'), 'Creator send a message');
  });
  it('Add a new user to Group', function () {
    return qlib.promise2console(Bank.addUserToGroup(LastConversationNotified.id, 'luka', 'ra'), 'Creator adds a User');
  });
  it('Newly added user sends a message to 1-user group', function () {
    return qlib.promise2console(Bank.processNewMessage('luka', LastConversationNotified.id, null, 'There you go!'), 'New User sends a message');
  });
  it('Newly added user adds another user to Group', function () {
    return qlib.promise2console(Bank.addUserToGroup(LastConversationNotified.id, 'ra', 'andra'), 'New User adds another User to Group');
  });
  it('Latest user sends a message to Group', function () {
    return qlib.promise2console(Bank.addUserToGroup(LastConversationNotified.id, 'luka', 'ra'), 'Last users sends a message');
  });
});
