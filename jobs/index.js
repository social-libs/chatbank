function createJobs (lib, jobondestroyablelib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    ret = {};
  require('./onbankcreator')(lib, jobondestroyablelib, ret),
  require('./findentitycreator')(lib, ret);
  require('./findusercreator')(lib, ret);
  require('./findconversationcreator')(lib, ret);
  require('./findmessagecreator')(lib, ret);
  require('./getconversationmessagescreator')(lib, ret);
  require('./processnewmessagecreator')(lib, ret);

  return ret;
}

module.exports = createJobs;
