var lib = require('./lib');
describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    return setGlobal('Bank', lib.createBank('basictest.db', true));
  });
  it('Process new P2P Message', function () {
    return qlib.promise2console(Bank.processNewMessage('andra', null, 'luka', 'blah'), 'P2P');
  });
});
