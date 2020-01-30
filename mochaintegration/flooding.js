var flooddescproperties = ['bankname', 'from', 'to', 'template'],
  floods = new lib.Map(),
  zeroString = String.fromCharCode(0)
;


function p2pmessage (from, to, msg, bankname) {
  //console.log('p2pmessage', from , to, msg);
  return getGlobal(bankname).processNewMessage(from, null, to, msg);
}

function groupmessage (from, togroup, msg, bankname) {
  //console.log('groupmessage', from , to, msg);
  return getGlobal(bankname).processNewMessage(from, togroup, null, msg);
}

function Flood (desc) {
  checkPropertiesOn(desc, flooddescproperties);
  this.bankname = desc.bankname;
  this.from = desc.from;
  this.to = desc.to;
  this.template = desc.template;
  this.index = 0;
  this.floodname = Flood.floodname(this);
}
Flood.prototype.destroy = function () {
  if (floods.get(this.floodname) === this) {
    floods.remove(this.floodname);
  }
  this.floodname = null;
  this.index = null;
  this.template = null;
  this.to = null;
  this.from = null;
  this.bankname = null;
};
Flood.prototype.go = function () {
  if (floods.get(this.floodname)) {
    return;
  }
  floods.add(this.floodname, this);
  this.init().then(
    this.send.bind(this)
  );
};
Flood.prototype.send = function () {
  var msgobj;
  if (!(
    this.from
    && this.to
    && this.template
    && lib.isNumber(this.index)
  )){
    this.destroy();
    return;
  }
  this.index++;
  msgobj = this.messageObject();
  this.sendMessage(msgobj.from, msgobj.to, msgobj.msg).then(
    this.send.bind(this),
    this.destroy.bind(this)
  );
};
Flood.prototype.init = function () {
  return q(true);
};
Flood.floodname = function (obj) {
  checkPropertiesOn(obj, flooddescproperties);
  return obj.from+zeroString+JSON.stringify(obj.to)+zeroString+obj.template;
};

function P2PFlood (desc) {
  Flood.call(this, desc);
  if (!lib.isString(this.to)) {
    throw new Error('The "to" field of P2PFlood has to be a String');
  }
}
lib.inherit(P2PFlood, Flood);
P2PFlood.prototype.sendMessage = function (from, to, msg) {
  return p2pmessage(from, to, msg, this.bankname);
};

function P2PMessageFlood (desc) {
  P2PFlood.call(this, desc);
}
lib.inherit(P2PMessageFlood, P2PFlood);
P2PMessageFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from,
    msg: this.template+':'+this.index
  };
};

function P2PConversationFlood (desc) {
  P2PFlood.call(this, desc);
}
lib.inherit(P2PConversationFlood, P2PFlood);
P2PConversationFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from+'_'+this.index,
    msg: this.template
  };
};

function GroupFlood (desc) {
  Flood.call(this, desc);
  checkPropertiesOn(this.to, ['groupname', 'members']);
  this.groupid = null;
}
lib.inherit(GroupFlood, Flood);
GroupFlood.prototype.destroy = function () {
  this.groupid = null;
  Flood.prototype.destroy.call(this);
};
GroupFlood.prototype.sendMessage = function (from, to, msg) {
  if (!this.bankname) {
    return q.reject(new Error(this.constructor.name+' already destroyed'));
  }
  return groupmessage(from, to, msg, this.bankname);
};
GroupFlood.prototype.createGroup = function (from, gname) {
  if (!gname) {
    throw new Error('cannot createGroup without a group name');
  }
  if (!this.bankname) {
    return q.reject(new Error(this.constructor.name+' already destroyed'));
  }
  return getGlobal(this.bankname).createNewGroup(from, gname).then(
    this.onGroup.bind(this, from),
    console.error.bind(console, 'oops createNewGroup')
  );
};
GroupFlood.prototype.onGroup = function (from, groupid) {
  var _f = from, ret;
  if (!this.to) {
    return q.reject(new Error(this.constructor.name+' already destroyed'));
  }
  this.groupid = groupid;
  ret = q.all(this.to.members.map(this.groupAdder.bind(this, _f)));
  _f = null;
  return ret;
};
GroupFlood.prototype.groupAdder = function (from, userid) {
  if (!this.bankname) {
    return q.reject(new Error(this.constructor.name+' already destroyed'));
  }
  return getGlobal(this.bankname).addUserToGroup(this.groupid, from, userid);
};

function GroupMessageFlood (desc) {
  GroupFlood.call(this, desc);
}
lib.inherit(GroupMessageFlood, GroupFlood);
GroupMessageFlood.prototype.init = function () {
  return this.createGroup(this.from, this.to.groupname);
};
GroupMessageFlood.prototype.messageObject = function () {
  return {
    to: this.groupid,
    from: this.from,
    msg: this.template+':'+this.index
  }
};

function GroupConversationFlood (desc) {
  GroupFlood.call(this, desc);
}
lib.inherit(GroupConversationFlood, GroupFlood);
GroupConversationFlood.prototype.sendMessage = function (from, to_ignored, msg) {
  return this.createGroup(from, this.to.groupname).then(
    this.onGroupForSend.bind(this, from, msg)
  );
};
GroupConversationFlood.prototype.onGroupForSend = function (from, msg) {
  var ret = GroupFlood.prototype.sendMessage.call(this, from, this.groupid, msg);
  from = null;
  msg = null;
  return ret;
};
GroupConversationFlood.prototype.messageObject = function () {
  return {
    to: this.groupid,
    from: this.from+'_'+this.index,
    msg: this.template
  }
};

function startP2PMessageFlood (obj) {
  return (new P2PMessageFlood(obj)).go();
}
function startP2PConversationFlood (obj) {
  return (new P2PConversationFlood(obj)).go();
}
function startGroupMessageFlood (obj) {
  return (new GroupMessageFlood(obj)).go();
}
function startGroupConversationFlood (obj) {
  return (new GroupConversationFlood(obj)).go();
}
function stopFlood (obj) {
  var f = floods.remove(Flood.floodname(obj)),
    ret;
  if (f) {
    ret = f.index;
    f.destroy();
  }
  return ret;
}
function floodFromDescriptor (desc) {
  return floods.get(Flood.floodname(desc));
}

setGlobal('p2pmessage', p2pmessage);
setGlobal('groupmessage', groupmessage);
setGlobal('startP2PMessageFlood', startP2PMessageFlood);
setGlobal('startP2PConversationFlood', startP2PConversationFlood);
setGlobal('stopFlood', stopFlood);
setGlobal('floodFromDescriptor', floodFromDescriptor);
setGlobal('startGroupMessageFlood', startGroupMessageFlood);
setGlobal('startGroupConversationFlood', startGroupConversationFlood);
