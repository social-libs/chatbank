var flooddescproperties = ['bankname', 'from', 'to', 'template'],
  floods = new lib.Map(),
  zeroString = String.fromCharCode(0)
;


function p2pmessage (from, to, msg, bankname) {
  //console.log('p2pmessage', from , to, msg);
  return getGlobal(bankname).processNewMessage(from, null, to, msg);
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
  this.send();
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
  p2pmessage(msgobj.from, msgobj.to, msgobj.msg, this.bankname).then(
    this.send.bind(this),
    this.destroy.bind(this)
  );
};
Flood.floodname = function (obj) {
  checkPropertiesOn(obj, flooddescproperties);
  return obj.from+zeroString+obj.to+zeroString+obj.template;
};

function MessageFlood (desc) {
  Flood.call(this, desc);
}
lib.inherit(MessageFlood, Flood);
MessageFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from,
    msg: this.template+':'+this.index
  };
};

function ConversationFlood (desc) {
  Flood.call(this, desc);
}
lib.inherit(ConversationFlood, Flood);
ConversationFlood.prototype.messageObject = function () {
  return {
    to: this.to,
    from: this.from+':'+this.index,
    msg: this.template
  };
};

function startMessageFlood (obj) {
  return (new MessageFlood(obj)).go();
}
function startConversationFlood (obj) {
  return (new ConversationFlood(obj)).go();
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
setGlobal('startMessageFlood', startMessageFlood);
setGlobal('startConversationFlood', startConversationFlood);
setGlobal('stopFlood', stopFlood);
setGlobal('floodFromDescriptor', floodFromDescriptor);
