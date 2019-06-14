function createJobs (lib, jobondestroyablelib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnBank = require('./onbankcreator')(lib, jobondestroyablelib),
    FindConversationJob = require('./findconversationcreator')(lib, JobOnBank);


}

module.exports = createJobs;
