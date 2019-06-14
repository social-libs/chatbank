function createJobOnBank (lib, jobondestroyablelib) {
  'use strict';

  var JobOnDestroyableBase = jobondestroyablelib.JobOnDestroyableBase;

  function JobOnBank (bank, defer) {
    JobOnDestroyableBase.call(this, bank, defer);
  }
  lib.inherit(JobOnBank, JobOnDestroyableBase);
  JobOnBank.prototype._destroyableOk = function () {
    return this.destroyable && this.destroyable.users;
  };

  return JobOnBank;
}

module.exports = createJobOnBank;
