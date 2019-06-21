function createJobs (lib, jobondestroyablelib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    ret = {};
  require('./onbankcreator')(lib, jobondestroyablelib, ret),
  require('./putentitycreator')(lib, ret);
  require('./putusercreator')(lib, ret);
  require('./putconversationcreator')(lib, ret);
  require('./pushentitycreator')(lib, ret);
  require('./pushmessagecreator')(lib, ret);
  require('./findentitycreator')(lib, ret);
  require('./findusercreator')(lib, ret);
  require('./findconversationcreator')(lib, ret);
  require('./findmessagecreator')(lib, ret);
  require('./getconversationmessagescreator')(lib, ret);
  require('./processnewpeer2peermessagecreator')(lib, ret);
  require('./processnewpeer2groupmessagecreator')(lib, ret);
  require('./processnewmessagecreator')(lib, ret);
  require('./newchatgroupcreator')(lib, ret);
  require('./alterusersonchatgroupcreator')(lib, ret);
  require('./addusertochatgroupcreator')(lib, ret);
  require('./removeuserfromchatgroupcreator')(lib, ret);
  require('./allconversationsofusercreator')(lib, ret);

  return ret;
}

module.exports = createJobs;
