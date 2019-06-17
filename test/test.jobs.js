var lib = require('./lib');
describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    return setGlobal('Bank', lib.createBank('basictest.db', true));
  });
  it('Push a message', function () {
    return qlib.promise2console(lib.pushMessage('blah'), 'pushMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(lib.processNewMessage('blah', 'andra', 'luka', null), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(lib.processNewMessage('wut?', 'luka', 'andra', null), 'processNewPeer2PeerMessage');
  });
  it('Process new peer2peer message', function () {
    return qlib.promise2console(lib.processNewMessage("that's wut I sed", 'andra', 'luka', null), 'processNewPeer2PeerMessage');
  });
  it('Create new Chat Group', function () {
    return qlib.promise2console(lib.createNewChatGroup('andra'), 'createNewChatGroup');
  });
});

