function createUtils (lib) {
  'use strict';

  function userandmidder (isgroup, myuserid, mid, msg) {
    if (msg.from===myuserid) {
      msg.from = null;
    } else if(!isgroup) {
      msg.from = '';
    }
    msg.id = mid;
    return msg;
  }

  return {
    userandmidder: userandmidder
  };
}

module.exports = createUtils;
