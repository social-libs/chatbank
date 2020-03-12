function createNewChatGroupJob (lib, mylib, utils) {
  'use strict';

  var JobOnBank = mylib.JobOnBank;

  function NewChatGroupWithMembersJob (bank, creatorid, groupname, memberarry, defer) {
    JobOnBank.call(this, bank, defer);
    this.creatorid = creatorid;
    this.groupname = groupname;
    this.members = memberarry;
    this.membercount = lib.isArray(this.members) ? this.members.length : 0;
    this.groupid = null;
  }
  lib.inherit(NewChatGroupWithMembersJob, JobOnBank);
  NewChatGroupWithMembersJob.prototype.destroy = function () {
    this.groupid = null;
    this.membercount = null;
    this.members = null;
    this.groupname = null;
    this.creatorid = null;
    JobOnBank.prototype.destroy.call(this);
  };
  NewChatGroupWithMembersJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    (new this.destroyable.Jobs.NewChatGroupJob(this.destroyable, this.creatorid, this.groupname)).go().then(
      this.onGroupCreated.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  NewChatGroupWithMembersJob.prototype.onGroupCreated = function (groupid) {
    if (!this.okToProceed()) {
      return;
    }
    this.groupid = groupid;
    this.addMember();
  };
  NewChatGroupWithMembersJob.prototype.addMember = function () {
    var memberid;
    if (!this.okToProceed()) {
      return;
    }
    if (!this.groupid) {
      this.reject(new lib.Error('NO_GROUP_ID', 'Newly created group should have had an id'));
      return;
    }
    if (!lib.isArray(this.members)) {
      this.doDaResolve();
      return;
    }
    if (this.members.length<1) {
      this.doDaResolve();
      return;
    }
    memberid = this.members.shift();
    if (!(lib.isString(memberid) && memberid.length>0)) {
      this.addMember();
      return;
    }
    (new this.destroyable.Jobs.AddNewUserToChatGroupJob(this.destroyable, this.groupid, this.creatorid, memberid)).go().then(
      this.addMember.bind(this),
      this.reject.bind(this)
    );
  };
  NewChatGroupWithMembersJob.prototype.doDaResolve = function () {
    this.resolve({
      name: this.groupname,
      id: this.groupid,
      members: this.membercount
    });
  }

  mylib.NewChatGroupWithMembersJob = NewChatGroupWithMembersJob;
}
module.exports = createNewChatGroupJob;
