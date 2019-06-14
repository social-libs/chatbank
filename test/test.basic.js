describe('Basic Test', function () {
  it('Load Library', function () {
    return setGlobal('Lib', require('../')(execlib));
  });
  it('Create Bank', function () {
    var d = q.defer();
    new Lib.Bank({
      path: require('path').join(__dirname, 'basictest.db'),
      initiallyemptydb: true,
      starteddefer: d
    })
    return setGlobal('Bank', d.promise);
  });
});
