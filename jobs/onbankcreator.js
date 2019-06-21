function createJobOnBank (lib, jobondestroyablelib, mylib) {
  'use strict';

  var JobOnDestroyableBase = jobondestroyablelib.JobOnDestroyableBase;

  function JobOnBank (bank, defer) {
    JobOnDestroyableBase.call(this, bank, defer);
  }
  lib.inherit(JobOnBank, JobOnDestroyableBase);
  JobOnBank.prototype._destroyableOk = function () {
    return this.destroyable
      && this.destroyable.users
      && this.destroyable.conversations
      && this.destroyable.messages
      && this.destroyable.conversationNotification
      ;
  };

  mylib.JobOnBank = JobOnBank;
}

module.exports = createJobOnBank;
