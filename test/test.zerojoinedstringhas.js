function zerojoinedstringhas (zjs, str) {
  var ind = zjs.indexOf(str);
  if (!(ind === 0 || zjs.charCodeAt(ind-1)===0)) {
    return false;
  }
  if (ind === 0) {
    return zjs.charCodeAt(str.length) === 0;
  }
  return ind+str.length===zjs.length;
}

var zeroString = String.fromCharCode(0),
  zjs = 'andra'+zeroString+'luka';

function doexpect (teststr, result) {
  return expect(zerojoinedstringhas(zjs, teststr)).to.equal(result);
}

describe('ZeroJoinedStringHas', function () {
  it('First', function () {
    return doexpect('andra', true);
  });
  it('Second', function () {
    return doexpect('luka', true);
  });
  it('First partial 1', function () {
    return doexpect('a', false);
  });
  it('First partial 2', function () {
    return doexpect('an', false);
  });
  it('First partial 3', function () {
    return doexpect('nd', false);
  });
  it('First partial 4', function () {
    return doexpect('ra', false);
  });
  it('First partial 5', function () {
    return doexpect('andr', false);
  });
  it('Second partial 1', function () {
    return doexpect('a', false);
  });
  it('Second partial 2', function () {
    return doexpect('ka', false);
  });
  it('Second partial 3', function () {
    return doexpect('uk', false);
  });
  it('Second partial 4', function () {
    return doexpect('luk', false);
  });
  it('Second partial 5', function () {
    return doexpect('uka', false);
  });
});
