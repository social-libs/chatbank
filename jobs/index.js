function createJobs (lib, utilslib, msgparsinglib, utils) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    ret = {};
  require('./onbankcreator')(lib, ret),
  require('./putentitycreator')(lib, ret);
  require('./putusercreator')(lib, ret);
  require('./putconversationcreator')(lib, ret);
  require('./putmessagecreator')(lib, ret);
  require('./pushentitycreator')(lib, ret);
  require('./pushmessagecreator')(lib, ret);
  require('./findentitycreator')(lib, ret);
  require('./findusercreator')(lib, ret);
  require('./findconversationcreator')(lib, ret);
  require('./findmessagecreator')(lib, ret);
  require('./delentitycreator')(lib, ret);
  require('./delconversationcreator')(lib, ret);
  require('./delmessagecreator')(lib, ret);
  require('./getconversationmessagescreator')(lib, ret);
  require('./processnewpeer2peermessagecreator')(lib, ret, utils);
  require('./processnewpeer2groupmessagecreator')(lib, ret, utils);
  require('./processnewmessagecreator')(lib, ret);
  require('./newchatgroupcreator')(lib, ret, utils);
  require('./alterusersonchatgroupcreator')(lib, ret);
  require('./addusertochatgroupcreator')(lib, ret, utils);
  require('./removeuserfromchatgroupcreator')(lib, ret);
  require('./allconversationsofusercreator')(lib, ret, utils);
  require('./initiateconversationsofuserforuserscreator')(lib, ret, utils);
  require('./messagesofconversationcreator')(lib, ret, utilslib, utils);
  require('./markmessagercvdcreator')(lib, ret, utils);
  require('./markmessageseencreator')(lib, ret, utils);
  require('./newchatgroupwithmemberscreator')(lib, ret, utils);
  require('./editmessagecreator')(lib, ret, utils);
  require('./optionalpreviewcreatorcreator')(lib, ret, msgparsinglib, utils);
  require('./updatemessagewithpreviewcreator')(lib, ret, msgparsinglib, utils);
  require('./ackuseractivitycreator')(lib, ret, utils);
  require('./removeconversationcreator')(lib, ret, utils);

  require('./conversationmessagestraverserbasecreator')(lib, ret);
  require('./conversationmessagesarchivercreator')(lib, ret);
  require('./conversationmessagesdeletercreator')(lib, ret);

  return ret;
}

module.exports = createJobs;
